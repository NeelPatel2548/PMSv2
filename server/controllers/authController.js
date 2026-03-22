const { validationResult } = require('express-validator');
const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const { success, error } = require('../utils/apiResponse');
const { generateOTP, hashOTP, verifyOTP, getOTPExpiry } = require('../services/otpService');
const { sendOTPEmail } = require('../services/emailService');
const { generateToken, setTokenCookie } = require('../middleware/authMiddleware');

// OTP Bypass helpers — NEVER active in production
const isProduction = () => process.env.NODE_ENV === 'production';
const isBypassMode = () => !isProduction() && process.env.BYPASS_OTP === 'true';
const isMagicCode = (otp) => !isProduction() && process.env.BYPASS_OTP_CODE && otp === process.env.BYPASS_OTP_CODE;

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed', 400, errors.array());
    }

    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return error(res, 'Email already registered', 400);
    }

    // Create user (password is hashed by pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    // BYPASS MODE: auto-verify, create profile, issue JWT directly
    if (isBypassMode()) {
      user.isVerified = true;
      user.otp = null;
      user.otpExpiry = null;
      user.otpAttempts = 0;
      await user.save();

      // Auto-create role-specific document
      if (user.role === 'student') {
        const existing = await Student.findOne({ user: user._id });
        if (!existing) await Student.create({ user: user._id });
      } else if (user.role === 'company') {
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

    // Normal flow: generate and send OTP
    const otp = generateOTP();
    user.otp = await hashOTP(otp);
    user.otpExpiry = getOTPExpiry(10);
    user.otpAttempts = 0;
    await user.save();

    // Bug Fix 2: If email fails, delete the ghost user
    try {
      await sendOTPEmail(email, otp, 'verification');
    } catch (emailError) {
      console.error('Email send failed during registration:', emailError);
      await User.findByIdAndDelete(user._id);
      return error(res, 'Failed to send OTP email. Please try again.', 500);
    }

    return success(res, null, 'OTP sent to email. Please verify your account.', 201);
  } catch (err) {
    console.error('Register error:', err);
    return error(res, 'Registration failed. Please try again.', 500);
  }
};

// @desc    Verify OTP (registration)
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
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

    // BYPASS: magic code or bypass mode skips all OTP checks
    const bypassOTP = isBypassMode() || isMagicCode(otp);

    if (!bypassOTP) {
      // Check OTP attempts — block if >= 5
      if (user.otpAttempts >= 5) {
        return error(res, 'Too many OTP attempts. Please request a new OTP.', 429);
      }

      // Check if OTP is expired
      if (!user.otpExpiry || new Date() > user.otpExpiry) {
        return error(res, 'OTP has expired. Please request a new one.', 400);
      }

      // Check if OTP exists
      if (!user.otp) {
        return error(res, 'No OTP found. Please request a new one.', 400);
      }

      // Verify OTP
      const isValid = await verifyOTP(otp, user.otp);

      if (!isValid) {
        // Increment attempts on failure
        user.otpAttempts += 1;
        await user.save();
        return error(res, `Invalid OTP. ${5 - user.otpAttempts} attempts remaining.`, 400);
      }
    }

    // OTP correct — verify user
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    await user.save();

    // Auto-create role-specific document
    if (user.role === 'student') {
      const existingStudent = await Student.findOne({ user: user._id });
      if (!existingStudent) {
        await Student.create({ user: user._id });
      }
    } else if (user.role === 'company') {
      const existingCompany = await Company.findOne({ user: user._id });
      if (!existingCompany) {
        await Company.create({ user: user._id, name: user.name });
      }
    }

    // Generate token and set cookie
    const token = generateToken(user._id);
    setTokenCookie(res, token);

    return success(res, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      profileCompleted: user.profileCompleted
    }, 'Email verified successfully');
  } catch (err) {
    console.error('Verify OTP error:', err);
    return error(res, 'OTP verification failed', 500);
  }
};

// @desc    Login Step 1 — verify credentials, send OTP
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed', 400, errors.array());
    }

    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return error(res, 'Invalid email or password', 401);
    }

    // Check if active
    if (!user.isActive) {
      return error(res, 'Account has been suspended. Contact admin.', 403);
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return error(res, 'Invalid email or password', 401);
    }

    // Check if verified — if not, send verification OTP
    if (!user.isVerified) {
      // BYPASS MODE: auto-verify unverified accounts on login
      if (isBypassMode()) {
        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        user.otpAttempts = 0;
        await user.save();

        // Auto-create role-specific document
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

    // Admin OR bypass mode — direct login (skip OTP)
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

    // Send login OTP (5 min expiry) for non-admin users
    const otp = generateOTP();
    user.otp = await hashOTP(otp);
    user.otpExpiry = getOTPExpiry(5);
    // Do NOT reset otpAttempts on resend — only reset on successful verify
    await user.save();

    await sendOTPEmail(email, otp, 'login');

    return success(res, { requiresOTP: true, email }, 'OTP sent to email for login verification.');
  } catch (err) {
    console.error('Login error:', err);
    return error(res, 'Login failed. Please try again.', 500);
  }
};

// @desc    Login Step 2 — verify login OTP
// @route   POST /api/auth/login/verify
// @access  Public
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

    // BYPASS: magic code or bypass mode skips all OTP checks
    const bypassOTP = isBypassMode() || isMagicCode(otp);

    if (!bypassOTP) {
      // Check attempts BEFORE comparing
      if (user.otpAttempts >= 5) {
        return error(res, 'Too many OTP attempts. Please request a new OTP.', 429);
      }

      // Check expiry
      if (!user.otpExpiry || new Date() > user.otpExpiry) {
        return error(res, 'OTP has expired. Please login again.', 400);
      }

      if (!user.otp) {
        return error(res, 'No OTP found. Please login again.', 400);
      }

      // Verify OTP
      const isValid = await verifyOTP(otp, user.otp);

      if (!isValid) {
        user.otpAttempts += 1;
        await user.save();
        return error(res, `Invalid OTP. ${5 - user.otpAttempts} attempts remaining.`, 400);
      }
    }

    // Success — clear OTP and reset attempts
    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    await user.save();

    // Generate token and set cookie
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

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
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

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed', 400, errors.array());
    }

    const { email, purpose } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return error(res, 'User not found', 404);
    }

    // BYPASS MODE: return success without sending email
    if (isBypassMode()) {
      return success(res, null, 'OTP resent (bypass mode — no email sent).');
    }

    // Generate new OTP — DO NOT reset otpAttempts
    const otp = generateOTP();
    user.otp = await hashOTP(otp);
    user.otpExpiry = getOTPExpiry(purpose === 'login' ? 5 : 10);
    await user.save();

    const otpPurpose = purpose || 'verification';
    await sendOTPEmail(email, otp, otpPurpose);

    return success(res, null, 'OTP resent to email.');
  } catch (err) {
    console.error('Resend OTP error:', err);
    return error(res, 'Failed to resend OTP', 500);
  }
};

// @desc    Forgot password — send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
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

    // Generate reset OTP
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

// @desc    Verify forgot-password OTP
// @route   POST /api/auth/verify-reset-otp
// @access  Public
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

    // Mark as verified for reset
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

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
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

    user.password = newPassword; // Will be hashed by pre-save hook
    user.otpVerifiedForReset = false;
    await user.save();

    return success(res, null, 'Password reset successfully. Please login with your new password.');
  } catch (err) {
    console.error('Reset password error:', err);
    return error(res, 'Password reset failed', 500);
  }
};

// @desc    Get current user (check auth status)
// @route   GET /api/auth/me
// @access  Private
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
