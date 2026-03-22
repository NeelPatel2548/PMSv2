const Student = require('../models/Student');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { SKILLS_LIST } = require('../utils/constants');
const { success, error } = require('../utils/apiResponse');

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
