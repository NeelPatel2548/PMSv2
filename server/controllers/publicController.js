const Student = require('../models/Student');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const SystemSettings = require('../models/SystemSettings');
const { SKILLS_LIST } = require('../utils/constants');
const { success, error } = require('../utils/apiResponse');
const { sendEmail } = require('../services/emailService');
const { DEFAULT_LOGO_URL } = require('../models/SystemSettings');

// @desc    Get public placement stats (for landing page)
// @route   GET /api/public/stats
// @access  Public
exports.getStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const placedStudents = await Student.countDocuments({ placementStatus: 'placed' });
    const totalCompanies = await Company.countDocuments({ isApproved: true });
    const activeJobs = await Job.countDocuments({ status: 'open' });

    return success(res, {
      totalStudents,
      placedStudents,
      totalCompanies,
      activeJobs,
      placementRate: totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) : 0
    }, 'Public stats fetched');
  } catch (err) {
    console.error('Public stats error:', err);
    return error(res, 'Failed to fetch stats', 500);
  }
};

// @desc    Get public company list (for landing page)
// @route   GET /api/public/companies
// @access  Public
exports.getPublicCompanies = async (req, res) => {
  try {
    const companies = await Company.find({ isApproved: true, isActive: true })
      .select('name logo industry location tier')
      .sort({ tier: 1 })
      .limit(20);

    return success(res, companies, 'Companies fetched');
  } catch (err) {
    console.error('Public companies error:', err);
    return error(res, 'Failed to fetch companies', 500);
  }
};

// @desc    Get public job listings
// @route   GET /api/public/jobs
// @access  Public
exports.getPublicJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'open', deadline: { $gte: new Date() } })
      .populate('company', 'name logo tier location')
      .select('title jobType package location deadline openings')
      .sort({ createdAt: -1 })
      .limit(10);

    return success(res, jobs, 'Public jobs fetched');
  } catch (err) {
    console.error('Public jobs error:', err);
    return error(res, 'Failed to fetch jobs', 500);
  }
};

// @desc    Get predefined skills list
// @route   GET /api/public/skills
// @access  Public
exports.getSkills = (req, res) => {
  return success(res, SKILLS_LIST, 'Skills list fetched');
};

// @desc    Get public settings (contactEmail, companyName, phone, address, logoUrl)
// @route   GET /api/public/settings
// @access  Public (no auth required)
exports.getPublicSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.getSettings();
    return success(res, {
      companyName: settings.companyName || 'Placement Management System',
      contactEmail: settings.contactEmail || 'admin@pms.com',
      phone: settings.phone || '',
      address: settings.address || '',
      logoUrl: settings.logoUrl || DEFAULT_LOGO_URL
    }, 'Public settings fetched');
  } catch (err) {
    console.error('Public settings error:', err);
    return error(res, 'Failed to load settings', 500);
  }
};

// @desc    Contact form submission — sends email to admin
// @route   POST /api/public/contact
// @access  Public (no auth required)
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate all fields
    if (!name || !email || !subject || !message) {
      return error(res, 'All fields are required (name, email, subject, message)', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return error(res, 'Invalid email address', 400);
    }

    // Validate message length
    if (message.trim().length < 10) {
      return error(res, 'Message must be at least 10 characters', 400);
    }

    // Get admin email from settings
    const settings = await SystemSettings.getSettings();
    const adminEmail = settings?.contactEmail || process.env.EMAIL_USER || 'admin@pms.com';
    const companyName = settings?.companyName || 'Placement Management System';

    // Build HTML email to admin
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333; border-bottom: 3px solid #1a56db; padding-bottom: 12px;">New Contact Form Submission</h2>
        <table style="width:100%; border-collapse: collapse; margin-top: 16px;">
          <tr>
            <td style="padding:10px 12px; font-weight:bold; background:#f5f5f5; border: 1px solid #e0e0e0; width: 120px;">Name</td>
            <td style="padding:10px 12px; border: 1px solid #e0e0e0;">${name}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px; font-weight:bold; background:#f5f5f5; border: 1px solid #e0e0e0;">Email</td>
            <td style="padding:10px 12px; border: 1px solid #e0e0e0;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr>
            <td style="padding:10px 12px; font-weight:bold; background:#f5f5f5; border: 1px solid #e0e0e0;">Subject</td>
            <td style="padding:10px 12px; border: 1px solid #e0e0e0;">${subject}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px; font-weight:bold; background:#f5f5f5; border: 1px solid #e0e0e0; vertical-align:top;">Message</td>
            <td style="padding:10px 12px; border: 1px solid #e0e0e0; white-space: pre-wrap;">${message}</td>
          </tr>
        </table>
        <p style="color:#666; font-size:12px; margin-top:16px;">
          This email was sent from the Contact Us form on ${companyName}. 
          Reply directly to this email to respond to ${name}.
        </p>
      </div>
    `;

    // Send email to admin
    await sendEmail(
      adminEmail,
      `[Contact Form] ${subject}`,
      adminHtml
    );

    // Send auto-reply to the user
    const userHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #1a56db;">Thank you, ${name}!</h2>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p><strong>Your message:</strong></p>
        <blockquote style="border-left: 3px solid #1a56db; padding-left: 12px; color: #555; white-space: pre-wrap;">${message}</blockquote>
        <p style="margin-top: 20px;">Best regards,<br><strong>${companyName}</strong></p>
      </div>
    `;

    // Auto-reply (best effort — don't fail the request if this fails)
    try {
      await sendEmail(
        email,
        `We received your message — ${subject}`,
        userHtml
      );
    } catch (autoReplyErr) {
      console.warn('Auto-reply email failed (non-fatal):', autoReplyErr.message);
    }

    return success(res, null, 'Your message has been sent successfully!');
  } catch (err) {
    console.error('Contact form error:', err);
    return error(res, 'Failed to send message. Please try again later.', 500);
  }
};
