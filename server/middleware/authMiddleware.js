const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { error } = require('../utils/apiResponse');

/**
 * Protect routes — verify JWT from httpOnly cookie
 */
const protect = async (req, res, next) => {
  try {
    const token = req.cookies.pms_token;

    if (!token) {
      return error(res, 'Not authorized. Please login.', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user and check status
    const user = await User.findById(decoded.id);

    if (!user) {
      return error(res, 'User not found.', 401);
    }

    if (!user.isActive) {
      return error(res, 'Account has been suspended. Contact admin.', 403);
    }

    if (!user.isVerified) {
      return error(res, 'Account not verified. Please verify your email.', 403);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return error(res, 'Invalid token.', 401);
    }
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Token expired. Please login again.', 401);
    }
    return error(res, 'Authentication failed.', 401);
  }
};

/**
 * Authorize by role(s)
 * @param  {...string} roles - allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return error(res, 'Not authorized to access this resource.', 403);
    }
    next();
  };
};

/**
 * Generate JWT token
 * @param {string} id - user ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Set JWT as httpOnly cookie
 * @param {object} res - Express response
 * @param {string} token - JWT token
 */
const setTokenCookie = (res, token) => {
  res.cookie('pms_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

module.exports = { protect, authorize, generateToken, setTokenCookie };
