const rateLimit = require('express-rate-limit');

// General auth limiter — 20 requests per 15 min
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    errors: null
  },
  standardHeaders: true,
  legacyHeaders: false
});

// OTP verify limiter — 10 requests per 15 min
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many OTP attempts. Please try again after 15 minutes.',
    errors: null
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Resend OTP limiter — 5 requests per hour
const resendOTPLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many OTP resend requests. Please try again after an hour.',
    errors: null
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { authLimiter, otpLimiter, resendOTPLimiter };
