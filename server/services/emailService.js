const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

/**
 * Send an email
 * @param {string} to - recipient email
 * @param {string} subject - email subject
 * @param {string} html - HTML body
 */
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"PMS - Placement Management System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Email send error:', error.message);
    throw new Error('Failed to send email');
  }
};

/**
 * Send OTP email
 * @param {string} email - recipient email
 * @param {string} otp - the OTP code (plain text)
 * @param {string} purpose - 'verification' | 'login' | 'reset'
 */
const sendOTPEmail = async (email, otp, purpose = 'verification') => {
  const purposeText = {
    verification: 'Email Verification',
    login: 'Login Verification',
    reset: 'Password Reset'
  };

  const subject = `PMS - ${purposeText[purpose] || 'OTP Verification'}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #1a56db; text-align: center;">Placement Management System</h2>
      <p>Hello,</p>
      <p>Your OTP for <strong>${purposeText[purpose] || 'verification'}</strong> is:</p>
      <div style="text-align: center; margin: 24px 0;">
        <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a56db; background: #eff6ff; padding: 12px 24px; border-radius: 8px;">
          ${otp}
        </span>
      </div>
      <p style="color: #666;">This OTP is valid for <strong>${purpose === 'login' ? '5 minutes' : '10 minutes'}</strong>.</p>
      <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this email or contact support.</p>
    </div>
  `;

  return sendEmail(email, subject, html);
};

module.exports = { sendEmail, sendOTPEmail };
