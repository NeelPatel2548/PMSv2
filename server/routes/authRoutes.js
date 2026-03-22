const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  register,
  verifyOTP,
  login,
  loginVerify,
  logout,
  resendOTP,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  getMe
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter, otpLimiter, resendOTPLimiter } = require('../middleware/rateLimiter');

// Register
router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['student', 'company']).withMessage('Role must be student or company')
  ],
  register
);

// Verify OTP (registration)
router.post(
  '/verify-otp',
  otpLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
  ],
  verifyOTP
);

// Login Step 1
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
  ],
  login
);

// Login Step 2 — verify login OTP
router.post(
  '/login/verify',
  otpLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
  ],
  loginVerify
);

// Logout
router.post('/logout', protect, logout);

// Resend OTP
router.post(
  '/resend-otp',
  resendOTPLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('purpose').optional().isIn(['verification', 'login', 'reset']).withMessage('Invalid purpose')
  ],
  resendOTP
);

// Forgot password
router.post(
  '/forgot-password',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail()
  ],
  forgotPassword
);

// Verify reset OTP
router.post(
  '/verify-reset-otp',
  otpLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
  ],
  verifyResetOTP
);

// Reset password
router.post(
  '/reset-password',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  resetPassword
);

// Get current user
router.get('/me', protect, getMe);

module.exports = router;
