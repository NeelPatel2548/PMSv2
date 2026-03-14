const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * Generate a 6-digit numeric OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Hash an OTP for secure storage
 * @param {string} otp - plain text OTP
 * @returns {Promise<string>} hashed OTP
 */
const hashOTP = async (otp) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(otp, salt);
};

/**
 * Compare a plain OTP with a hashed OTP
 * @param {string} plainOTP - submitted OTP
 * @param {string} hashedOTP - stored hashed OTP
 * @returns {Promise<boolean>}
 */
const verifyOTP = async (plainOTP, hashedOTP) => {
  return await bcrypt.compare(plainOTP, hashedOTP);
};

/**
 * Get OTP expiry date
 * @param {number} minutes - minutes until expiry
 * @returns {Date}
 */
const getOTPExpiry = (minutes = 10) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

module.exports = { generateOTP, hashOTP, verifyOTP, getOTPExpiry };
