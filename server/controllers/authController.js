const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const { success, error } = require('../utils/apiResponse');
const { generateOTP, hashOTP, verifyOTP, getOTPExpiry } = require('../services/otpService');
const { sendOTPEmail } = require('../services/emailService');
const { generateToken, setTokenCookie } = require('../middleware/authMiddleware');

// ---------------------------------------------------------------------------
// OTP Bypass helpers — NEVER active in production
// ---------------------------------------------------------------------------
const isProduction = () => process.env.NODE_ENV === 'production';
const isBypassMode = () => !isProduction() && process.env.BYPASS_OTP === 'true';
const isMagicCode = (otp) => !isProduction() && process.env.BYPASS_OTP_CODE && otp === process.env.BYPASS_OTP_CODE;

// ---------------------------------------------------------------------------
// In-memory store for pending registrations (pre-OTP verification)
// Key: email (lowercase)
// Value: { name, email, hashedPassword, role, otp, otpExpiry }
// ---------------------------------------------------------------------------
const pendingRegistrations = new Map();

// Clean up expired entries every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of pendingRegistrations.entries()) {
    if (data.otpExpiry < now) {
      pendingRegistrations.delete(email);
    }
  }
}, 15 * 60 * 1000);

// ---------------------------------------------------------------------------
// @desc    Register a new user — stores temporarily, sends OTP
// @route   POST /api/auth/register
// @access  Public
// ---------------------------------------------------------------------------
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed', 400, errors.array());
    }

    const { name, email, password, role } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists in DB
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return error(res, 'Email already registered', 400);
    }

    // BYPASS MODE: skip OTP, create User + role doc directly and return
    if (isBypassMode()) {
      const user = await User.create({
        name,
        email: normalizedEmail,
        password,  // plain text — pre-save hook will hash it
        role,
        isVerified: true
      });

      if (role === 'student') {
        const existing = await Student.findOne({ user: user._id });
        if (!existing) await Student.create({ user: user._id });
      } else if (role === 'company') {
        const existing = await Company.findOne({ user: user._id });
        if (!existing) await Company.create({ user: user._id, name: user.name });
      }

      const token = generateToken(user._id);
      setTokenCookie(res, token);

      return success(res, {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: true,
        profileCompleted: user.profileCompleted
      }, 'Registration successful (OTP bypassed)', 201);
    }

    // Hash password now — store in memory, NOT in DB yet
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store pending registration in memory
    pendingRegistrations.set(normalizedEmail, {
      name,
      email: normalizedEmail,
      hashedPassword,
      role,
      otp,
      otpExpiry
    });


    // Send OTP email — if it fails, remove from map so user can retry
    try {
      await sendOTPEmail(normalizedEmail, otp, 'verification');
    } catch (emailError) {
      console.error('Email send failed during registration:', emailError);
      pendingRegistrations.delete(normalizedEmail);
      return error(res, 'Failed to send verification email. Please try again.', 500);
    }

    return success(res, null, 'OTP sent to your email. Please verify to complete registration.');
  } catch (err) {
    console.error('Register error:', err);
    return error(res, 'Registration failed. Please try again.', 500);
  }
};

// ---------------------------------------------------------------------------
// @desc    Verify registration OTP — creates User in DB on success
// @route   POST /api/auth/verify-otp
// @access  Public
// ---------------------------------------------------------------------------
exports.verifyOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed', 400, errors.array());
    }

    const { email, otp } = req.body;
    const normalizedEmail = email.toLowerCase().trim();


    // Look up pending registration
    const pending = pendingRegistrations.get(normalizedEmail);

    if (!pending) {
      return error(res, 'Session expired. Please register again.', 400);
    }

    // Check OTP expiry
    if (pending.otpExpiry < Date.now()) {
      pendingRegistrations.delete(normalizedEmail);
      return error(res, 'OTP expired. Please register again.', 400);
    }

    // Skip OTP check in bypass / magic-code mode
    const bypassOTP = isBypassMode() || isMagicCode(otp);

    if (!bypassOTP) {
      // Compare submitted OTP with stored plain OTP
      if (String(otp).trim() !== String(pending.otp).trim()) {
        return error(res, 'Invalid OTP. Please try again.', 400);
      }
    }


    try {
      // OTP valid — create the User document now.
      // Use `new User().save()` with password set directly as hash to bypass
      // the pre-save bcrypt hook (password is already hashed from /register step).
      const newUser = new User({
        name: pending.name,
        email: pending.email,
        role: pending.role,
        isVerified: true
      });
      // Assign hashed password directly — mark as NOT modified so pre-save hook skips it
      newUser.password = pending.hashedPassword;
      newUser.$locals.skipHash = true;
      const user = await newUser.save();

      // Create role-specific document
      if (pending.role === 'student') {
        const student = await Student.create({ user: user._id });
      }
      if (pending.role === 'company') {
        const company = await Company.create({ user: user._id, name: pending.name });
      }

      // Remove from pending map
      pendingRegistrations.delete(normalizedEmail);

      // Do NOT auto-issue JWT — force the user to login (cleaner security model)
      return success(res, null, 'Account created successfully. Please log in.', 201);
    } catch (createError) {
      console.error('[VERIFY-OTP] CREATION FAILED:', {
        message: createError.message,
        name: createError.name,
        code: createError.code,
        errors: JSON.stringify(createError.errors, null, 2)
      });
      return res.status(500).json({
        message: createError.message,
        details: createError.errors
      });
    }
  } catch (err) {
    console.error('[VERIFY-OTP] OUTER ERROR:', {
      message: err.message,
      name: err.name,
      errors: JSON.stringify(err.errors, null, 2),
      stack: err.stack
    });
    return res.status(500).json({ message: err.message });
  }
};

// ---------------------------------------------------------------------------
// @desc    Resend OTP for pending registration
// @route   POST /api/auth/resend-otp
// @access  Public
// ---------------------------------------------------------------------------
exports.resendOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed', 400, errors.array());
    }

    const { email, purpose } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // BYPASS MODE
    if (isBypassMode()) {
      return success(res, null, 'OTP resent (bypass mode — no email sent).');
    }

    // Check if this is a pending registration resend
    const pending = pendingRegistrations.get(normalizedEmail);
    if (pending) {
      const otp = generateOTP();
      pending.otp = otp;
      pending.otpExpiry = Date.now() + 10 * 60 * 1000;
      pendingRegistrations.set(normalizedEmail, pending);

      try {
        await sendOTPEmail(normalizedEmail, otp, 'verification');
      } catch (emailError) {
        console.error('Resend OTP email failed:', emailError);
        return error(res, 'Failed to resend OTP email. Please try again.', 500);
      }

      return success(res, null, 'New OTP sent to your email.');
    }

    // Otherwise, handle login OTP resend (user exists in DB)
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return error(res, 'No pending session found for this email. Please register or login again.', 400);
    }

    const otp = generateOTP();
    user.otp = await hashOTP(otp);
    user.otpExpiry = getOTPExpiry(purpose === 'login' ? 5 : 10);
    user.otpAttempts = 0;
    await user.save();

    const otpPurpose = purpose || 'verification';
    await sendOTPEmail(normalizedEmail, otp, otpPurpose);

    return success(res, null, 'OTP resent to email.');
  } catch (err) {
    console.error('Resend OTP error:', err);
    return error(res, 'Failed to resend OTP', 500);
  }
};

// ---------------------------------------------------------------------------
// @desc    Login Step 1 — verify credentials, send login OTP
// @route   POST /api/auth/login
// @access  Public
// ---------------------------------------------------------------------------
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed', 400, errors.array());
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return error(res, 'Invalid email or password', 401);
    }

    if (!user.isActive) {
      return error(res, 'Account has been suspended. Contact admin.', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return error(res, 'Invalid email or password', 401);
    }

    // Account exists in DB but isVerified=false should not happen anymore
    // (we only create User after OTP verification), but handle gracefully
    if (!user.isVerified) {
      if (isBypassMode()) {
        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        user.otpAttempts = 0;
        await user.save();

        if (user.role === 'student') {
          const existing = await Student.findOne({ user: user._id });
          if (!existing) await Student.create({ user: user._id });
        } else if (user.role === 'company') {
          const existing = await Company.findOne({ user: user._id });
          if (!existing) await Company.create({ user: user._id, name: user.name });
        }
      } else {
        const otp = generateOTP();
        user.otp = await hashOTP(otp);
        user.otpExpiry = getOTPExpiry(10);
        user.otpAttempts = 0;
        await user.save();
        await sendOTPEmail(email, otp, 'verification');
        return success(res, { requiresVerification: true, email }, 'Account not verified. OTP sent to email.');
      }
    }

    // Admin or bypass — direct login without login OTP
    if (user.role === 'admin' || isBypassMode()) {
      const token = generateToken(user._id);
      setTokenCookie(res, token);
      return success(res, {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profileCompleted: user.profileCompleted
      }, 'Login successful');
    }

    // Send login OTP (5 min) for students and companies
    const otp = generateOTP();
    user.otp = await hashOTP(otp);
    user.otpExpiry = getOTPExpiry(5);
    user.otpAttempts = 0;
    await user.save();

    await sendOTPEmail(email, otp, 'login');

    return success(res, { requiresOTP: true, email }, 'OTP sent to email for login verification.');
  } catch (err) {
    console.error('Login error:', err);
    return error(res, 'Login failed. Please try again.', 500);
  }
};

// ---------------------------------------------------------------------------
// @desc    Login Step 2 — verify login OTP
// @route   POST /api/auth/login/verify
// @access  Public
// ---------------------------------------------------------------------------
exports.loginVerify = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed', 400, errors.array());
    }

    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return error(res, 'User not found', 404);
    }

    const bypassOTP = isBypassMode() || isMagicCode(otp);

    if (!bypassOTP) {
      if (user.otpAttempts >= 5) {
        return error(res, 'Too many OTP attempts. Please request a new OTP.', 429);
      }

      if (!user.otpExpiry || new Date() > user.otpExpiry) {
        return error(res, 'OTP has expired. Please login again.', 400);
      }

      if (!user.otp) {
        return error(res, 'No OTP found. Please login again.', 400);
      }

      const isValid = await verifyOTP(otp, user.otp);

      if (!isValid) {
        user.otpAttempts += 1;
        await user.save();
        return error(res, `Invalid OTP. ${5 - user.otpAttempts} attempts remaining.`, 400);
      }
    }

    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    await user.save();

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    return success(res, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      profileCompleted: user.profileCompleted,
      profileImageUrl: user.profileImageUrl
    }, 'Login successful');
  } catch (err) {
    console.error('Login verify error:', err);
    return error(res, 'Login verification failed', 500);
  }
};

// ---------------------------------------------------------------------------
// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
// ---------------------------------------------------------------------------
exports.logout = async (req, res) => {
  try {
    res.clearCookie('pms_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    return success(res, null, 'Logged out successfully');
  } catch (err) {
    console.error('Logout error:', err);
    return error(res, 'Logout failed', 500);
  }
};

// ---------------------------------------------------------------------------
// @desc    Forgot password — send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
// ---------------------------------------------------------------------------
exports.forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed', 400, errors.array());
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return error(res, 'No account found with that email', 404);
    }

    if (!user.isActive) {
      return error(res, 'Account has been suspended', 403);
    }

    const otp = generateOTP();
    user.otp = await hashOTP(otp);
    user.otpExpiry = getOTPExpiry(10);
    user.otpAttempts = 0;
    user.otpVerifiedForReset = false;
    await user.save();

    await sendOTPEmail(email, otp, 'reset');

    return success(res, null, 'Password reset OTP sent to email.');
  } catch (err) {
    console.error('Forgot password error:', err);
    return error(res, 'Failed to send reset OTP', 500);
  }
};

// ---------------------------------------------------------------------------
// @desc    Verify forgot-password OTP
// @route   POST /api/auth/verify-reset-otp
// @access  Public
// ---------------------------------------------------------------------------
exports.verifyResetOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed', 400, errors.array());
    }

    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return error(res, 'User not found', 404);
    }

    if (user.otpAttempts >= 5) {
      return error(res, 'Too many OTP attempts. Please request a new OTP.', 429);
    }

    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      return error(res, 'OTP has expired. Please request a new one.', 400);
    }

    if (!user.otp) {
      return error(res, 'No OTP found. Please request a new one.', 400);
    }

    const isValid = await verifyOTP(otp, user.otp);

    if (!isValid) {
      user.otpAttempts += 1;
      await user.save();
      return error(res, `Invalid OTP. ${5 - user.otpAttempts} attempts remaining.`, 400);
    }

    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    user.otpVerifiedForReset = true;
    await user.save();

    return success(res, null, 'OTP verified. You can now reset your password.');
  } catch (err) {
    console.error('Verify reset OTP error:', err);
    return error(res, 'OTP verification failed', 500);
  }
};

// ---------------------------------------------------------------------------
// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
// ---------------------------------------------------------------------------
exports.resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed', 400, errors.array());
    }

    const { email, newPassword } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return error(res, 'User not found', 404);
    }

    if (!user.otpVerifiedForReset) {
      return error(res, 'Please verify OTP before resetting password.', 400);
    }

    // Will be hashed by pre-save hook
    user.password = newPassword;
    user.otpVerifiedForReset = false;
    await user.save();

    return success(res, null, 'Password reset successfully. Please login with your new password.');
  } catch (err) {
    console.error('Reset password error:', err);
    return error(res, 'Password reset failed', 500);
  }
};

// ---------------------------------------------------------------------------
// @desc    Get current user (check auth status)
// @route   GET /api/auth/me
// @access  Private
// ---------------------------------------------------------------------------
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return error(res, 'User not found', 404);
    }

    return success(res, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isActive: user.isActive,
      profileCompleted: user.profileCompleted,
      profileImageUrl: user.profileImageUrl
    }, 'User fetched');
  } catch (err) {
    console.error('Get me error:', err);
    return error(res, 'Failed to fetch user', 500);
  }
};
