const { validationResult } = require('express-validator');
const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Notification = require('../models/Notification');
const PlacementReport = require('../models/PlacementReport');
const { success, error } = require('../utils/apiResponse');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (admin)
exports.getDashboard = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const placedStudents = await Student.countDocuments({ placementStatus: 'placed' });
    const totalCompanies = await Company.countDocuments();
    const approvedCompanies = await Company.countDocuments({ isApproved: true });
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'open' });
    const totalApplications = await Application.countDocuments();

    // Branch-wise placement stats
    const branches = ['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'Other'];
    const branchWiseStats = await Promise.all(
      branches.map(async (branch) => {
        const total = await Student.countDocuments({ branch });
        const placed = await Student.countDocuments({ branch, placementStatus: 'placed' });
        return { branch, total, placed };
      })
    );

    // Recent activities
    const recentApplications = await Application.find()
      .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
      .populate('job', 'title')
      .populate('company', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    return success(res, {
      stats: {
        totalStudents,
        placedStudents,
        unplacedStudents: totalStudents - placedStudents,
        totalCompanies,
        approvedCompanies,
        pendingCompanies: totalCompanies - approvedCompanies,
        totalJobs,
        activeJobs,
        totalApplications,
        placementRate: totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) : 0
      },
      branchWiseStats,
      recentApplications
    }, 'Dashboard fetched');
  } catch (err) {
    console.error('Admin dashboard error:', err);
    return error(res, 'Failed to fetch dashboard', 500);
  }
};

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private (admin)
exports.getStudents = async (req, res) => {
  try {
    const { branch, passingYear, placementStatus, search } = req.query;
    const filter = {};

    if (branch) filter.branch = branch;
    if (passingYear) filter.passingYear = parseInt(passingYear);
    if (placementStatus) filter.placementStatus = placementStatus;

    let students = Student.find(filter)
      .populate('user', 'name email isActive isVerified profileImageUrl')
      .populate('placedIn', 'name');

    if (search) {
      const users = await User.find({
        role: 'student',
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      const userIds = users.map(u => u._id);
      students = students.where('user').in(userIds);
    }

    const result = await students.sort({ createdAt: -1 });

    return success(res, result, 'Students fetched');
  } catch (err) {
    console.error('Get students error:', err);
    return error(res, 'Failed to fetch students', 500);
  }
};

// @desc    Get single student profile (view only)
// @route   GET /api/admin/students/:id
// @access  Private (admin)
exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', 'name email isActive isVerified profileImageUrl createdAt')
      .populate('placedIn', 'name');

    if (!student) {
      return error(res, 'Student not found', 404);
    }

    return success(res, student, 'Student fetched');
  } catch (err) {
    console.error('Get student error:', err);
    return error(res, 'Failed to fetch student', 500);
  }
};

// @desc    Update student academic records (admin)
// @route   PUT /api/admin/students/:id/academic
// @access  Private (admin)
exports.updateStudentAcademic = async (req, res) => {
  try {
    const allowed = ['enrollmentNo', 'branch', 'passingYear',
                     'cgpa', 'tenthPercentage', 'twelfthPercentage', 'activeBacklogs'];
    const updates = {};
    allowed.forEach(key => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    // Reset verification since data changed
    updates.academicVerified = false;
    updates.academicVerifiedBy = null;
    updates.academicVerifiedAt = null;

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      updates,
      { returnDocument: 'after', runValidators: true }
    ).populate('user', 'name email isActive isVerified profileImageUrl createdAt')
     .populate('placedIn', 'name');

    if (!student) {
      return error(res, 'Student not found', 404);
    }

    return success(res, student, 'Academic records updated. Verification has been reset.');
  } catch (err) {
    console.error('Update student academic error:', err);
    return error(res, 'Failed to update academic records', 500);
  }
};

// @desc    Verify student academic records (admin)
// @route   PUT /api/admin/students/:id/verify-academic
// @access  Private (admin)
exports.verifyStudentAcademic = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return error(res, 'Student not found', 404);
    }

    student.academicVerified = true;
    student.academicVerifiedBy = req.user._id;
    student.academicVerifiedAt = new Date();
    await student.save();

    // Notify student
    await Notification.create({
      user: student.user,
      title: 'Academic Records Verified',
      message: 'Your academic records have been verified by the administration.',
      type: 'announcement'
    });

    const updated = await Student.findById(req.params.id)
      .populate('user', 'name email isActive isVerified profileImageUrl createdAt')
      .populate('placedIn', 'name')
      .populate('academicVerifiedBy', 'name');

    return success(res, updated, 'Academic records verified successfully');
  } catch (err) {
    console.error('Verify student academic error:', err);
    return error(res, 'Failed to verify academic records', 500);
  }
};

// @desc    Get all companies
// @route   GET /api/admin/companies
// @access  Private (admin)
exports.getCompanies = async (req, res) => {
  try {
    const { isApproved, tier, search } = req.query;
    const filter = {};

    if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
    if (tier) filter.tier = tier;

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const companies = await Company.find(filter)
      .populate('user', 'name email isActive isVerified')
      .sort({ createdAt: -1 });

    return success(res, companies, 'Companies fetched');
  } catch (err) {
    console.error('Get companies error:', err);
    return error(res, 'Failed to fetch companies', 500);
  }
};

// @desc    Approve/reject a company
// @route   PUT /api/admin/companies/:id/approve
// @access  Private (admin)
exports.approveCompany = async (req, res) => {
  try {
    const { isApproved } = req.body;

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { returnDocument: 'after', runValidators: true }
    ).populate('user', 'name email');

    if (!company) {
      return error(res, 'Company not found', 404);
    }

    // Notify company
    await Notification.create({
      user: company.user._id,
      title: isApproved ? 'Company Approved' : 'Company Approval Revoked',
      message: isApproved
        ? 'Your company has been approved. You can now post jobs.'
        : 'Your company approval has been revoked. Contact admin for details.',
      type: 'announcement'
    });

    return success(res, company, `Company ${isApproved ? 'approved' : 'rejected'}`);
  } catch (err) {
    console.error('Approve company error:', err);
    return error(res, 'Failed to update company approval', 500);
  }
};

// @desc    Update company details (admin)
// @route   PUT /api/admin/companies/:id
// @access  Private (admin)
exports.updateCompany = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed', 400, errors.array());
    }

    // Whitelist — NEVER allow isApproved, isActive, user via this route
    const allowed = ['name', 'industry', 'location', 'website', 'description',
                     'hrName', 'hrEmail', 'hrPhone', 'logo', 'tier'];
    const updates = {};
    allowed.forEach(key => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      updates,
      { returnDocument: 'after', runValidators: true }
    ).populate('user', 'name email');

    if (!company) {
      return error(res, 'Company not found', 404);
    }

    return success(res, company, 'Company updated');
  } catch (err) {
    console.error('Update company error:', err);
    return error(res, 'Failed to update company', 500);
  }
};

// @desc    Get all jobs
// @route   GET /api/admin/jobs
// @access  Private (admin)
exports.getJobs = async (req, res) => {
  try {
    const { status, jobType, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (jobType) filter.jobType = jobType;

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const jobs = await Job.find(filter)
      .populate('company', 'name logo tier')
      .sort({ createdAt: -1 });

    return success(res, jobs, 'Jobs fetched');
  } catch (err) {
    console.error('Get jobs error:', err);
    return error(res, 'Failed to fetch jobs', 500);
  }
};

// @desc    Update job (admin)
// @route   PUT /api/admin/jobs/:id
// @access  Private (admin)
exports.updateJob = async (req, res) => {
  try {
    const allowed = ['title', 'description', 'requiredSkills', 'package', 'jobType',
                     'stipend', 'bondPeriod', 'location', 'minCGPA', 'maxBacklogs',
                     'eligibleBranches', 'openings', 'deadline', 'status'];
    const updates = {};
    allowed.forEach(key => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      updates,
      { returnDocument: 'after', runValidators: true }
    ).populate('company', 'name');

    if (!job) {
      return error(res, 'Job not found', 404);
    }

    return success(res, job, 'Job updated');
  } catch (err) {
    console.error('Admin update job error:', err);
    return error(res, 'Failed to update job', 500);
  }
};

// @desc    Delete a user with cascade cleanup
// @route   DELETE /api/admin/users/:id
// @access  Private (admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return error(res, 'User not found', 404);
    }

    if (user.role === 'student') {
      const student = await Student.findOne({ user: user._id });
      if (student) {
        // Cascade delete
        await Application.deleteMany({ student: student._id });
        await Interview.deleteMany({ student: student._id });
        await Student.findByIdAndDelete(student._id);
      }
    } else if (user.role === 'company') {
      const company = await Company.findOne({ user: user._id });
      if (company) {
        // Get all jobs by this company
        const jobIds = await Job.find({ company: company._id }).distinct('_id');
        // Cascade delete
        await Application.deleteMany({ company: company._id });
        await Interview.deleteMany({ company: company._id });
        await Job.deleteMany({ company: company._id });
        await Company.findByIdAndDelete(company._id);
      }
    }

    // Delete notifications and user
    await Notification.deleteMany({ user: user._id });
    await User.findByIdAndDelete(user._id);

    return success(res, null, 'User and all related data deleted');
  } catch (err) {
    console.error('Delete user error:', err);
    return error(res, 'Failed to delete user', 500);
  }
};

// @desc    Suspend/unsuspend a user
// @route   PUT /api/admin/users/:id/status
// @access  Private (admin)
exports.toggleUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { returnDocument: 'after' }
    );

    if (!user) {
      return error(res, 'User not found', 404);
    }

    // Notify user
    await Notification.create({
      user: user._id,
      title: isActive ? 'Account Reactivated' : 'Account Suspended',
      message: isActive
        ? 'Your account has been reactivated by admin.'
        : 'Your account has been suspended. Contact admin for details.',
      type: 'security'
    });

    return success(res, user, `User ${isActive ? 'activated' : 'suspended'}`);
  } catch (err) {
    console.error('Toggle user status error:', err);
    return error(res, 'Failed to update user status', 500);
  }
};

// @desc    Create a platform-wide announcement
// @route   POST /api/admin/announcements
// @access  Private (admin)
exports.createAnnouncement = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed', 400, errors.array());
    }

    const { title, message, targetRole } = req.body;

    // Get target users
    let filter = {};
    if (targetRole && targetRole !== 'all') {
      filter.role = targetRole;
    }
    filter.isActive = true;

    const users = await User.find(filter).select('_id');

    const notifications = users.map(u => ({
      user: u._id,
      title,
      message,
      type: 'announcement'
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    return success(res, { recipientCount: notifications.length }, 'Announcement sent');
  } catch (err) {
    console.error('Create announcement error:', err);
    return error(res, 'Failed to send announcement', 500);
  }
};

// @desc    Generate placement report
// @route   POST /api/admin/reports
// @access  Private (admin)
exports.generateReport = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed', 400, errors.array());
    }

    const { academicYear } = req.body;

    const totalStudents = await Student.countDocuments();
    const totalPlaced = await Student.countDocuments({ placementStatus: 'placed' });
    const totalApplications = await Application.countDocuments();

    // Calculate package stats from selected applications
    const selectedApps = await Application.find({ status: 'selected', offeredPackage: { $ne: null } });
    let packages = selectedApps
      .map(a => parseFloat(a.offeredPackage))
      .filter(p => !isNaN(p));

    const avgPackage = packages.length > 0
      ? packages.reduce((a, b) => a + b, 0) / packages.length
      : 0;
    const maxPackage = packages.length > 0 ? Math.max(...packages) : 0;

    // Branch-wise stats
    const branches = ['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'Other'];
    const branchWiseStats = await Promise.all(
      branches.map(async (branch) => {
        const total = await Student.countDocuments({ branch });
        const placed = await Student.countDocuments({ branch, placementStatus: 'placed' });
        return { branch, total, placed };
      })
    );

    const report = await PlacementReport.create({
      academicYear,
      totalStudents,
      totalPlaced,
      totalApplications,
      avgPackage: parseFloat(avgPackage.toFixed(2)),
      maxPackage,
      branchWiseStats,
      generatedBy: req.user._id
    });

    return success(res, report, 'Report generated', 201);
  } catch (err) {
    console.error('Generate report error:', err);
    return error(res, 'Failed to generate report', 500);
  }
};

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Private (admin)
exports.getReports = async (req, res) => {
  try {
    const reports = await PlacementReport.find()
      .populate('generatedBy', 'name email')
      .sort({ createdAt: -1 });

    return success(res, reports, 'Reports fetched');
  } catch (err) {
    console.error('Get reports error:', err);
    return error(res, 'Failed to fetch reports', 500);
  }
};
