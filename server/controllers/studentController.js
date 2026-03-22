const { validationResult } = require('express-validator');
const Student = require('../models/Student');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Notification = require('../models/Notification');
const { success, error } = require('../utils/apiResponse');
const { validateAndSaveFile } = require('../middleware/upload');

// @desc    Get student profile
// @route   GET /api/student/profile
// @access  Private (student)
exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id })
      .populate('user', 'name email profileImageUrl profileCompleted')
      .populate('placedIn', 'name logo');

    if (!student) {
      return error(res, 'Student profile not found', 404);
    }

    return success(res, student, 'Profile fetched');
  } catch (err) {
    console.error('Get profile error:', err);
    return error(res, 'Failed to fetch profile', 500);
  }
};

// @desc    Update student profile (student self-edit — restricted fields)
// @route   PUT /api/student/profile
// @access  Private (student)
exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed', 400, errors.array());
    }

    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return error(res, 'Student profile not found', 404);
    }

    // Whitelist allowed personal fields — always editable
    const personalFields = ['name', 'phone', 'address', 'gender', 'dob',
                     'linkedin', 'github', 'skills',
                     'projects', 'certifications', 'internshipExperience'];
    const academicFields = ['enrollmentNo', 'branch', 'passingYear',
                            'cgpa', 'tenthPercentage', 'twelfthPercentage', 'activeBacklogs'];

    // Check if request contains academic fields
    const hasAcademicUpdates = academicFields.some(key => req.body[key] !== undefined);

    // Block academic edits if already verified
    if (hasAcademicUpdates && student.academicVerified) {
      return error(res, 'Academic records are verified and locked. Contact admin to make changes.', 403);
    }

    const updates = {};

    // Personal fields (name handled separately on User)
    personalFields.forEach(key => {
      if (key === 'name') return;
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    // Academic fields (only when not verified)
    if (!student.academicVerified) {
      academicFields.forEach(key => {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
      });
    }

    const updatedStudent = await Student.findOneAndUpdate(
      { user: req.user._id },
      updates,
      { returnDocument: 'after', runValidators: true }
    ).populate('user', 'name email profileImageUrl profileCompleted');

    // If name was sent, update on User model too
    if (req.body.name && req.body.name.trim()) {
      await User.findByIdAndUpdate(req.user._id, { name: req.body.name.trim() });
    }

    // Check if profile is reasonably complete and update User.profileCompleted
    const isComplete = updatedStudent.phone && updatedStudent.gender && updatedStudent.branch;
    if (isComplete) {
      await User.findByIdAndUpdate(req.user._id, { profileCompleted: true });
    }

    // Re-fetch with updated user name
    const final = await Student.findOne({ user: req.user._id })
      .populate('user', 'name email profileImageUrl profileCompleted')
      .populate('academicVerifiedBy', 'name');

    return success(res, final, 'Profile updated');
  } catch (err) {
    console.error('Update profile error:', err);
    return error(res, 'Failed to update profile', 500);
  }
};

// @desc    Upload resume
// @route   POST /api/student/resume
// @access  Private (student)
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return error(res, 'No file uploaded', 400);
    }

    // Validate via magic bytes and save
    const resumeUrl = await validateAndSaveFile(req.file.buffer, req.user.id);

    const student = await Student.findOneAndUpdate(
      { user: req.user._id },
      { resumeUrl },
      { returnDocument: 'after', runValidators: true }
    );

    if (!student) {
      return error(res, 'Student profile not found', 404);
    }

    return success(res, { resumeUrl }, 'Resume uploaded successfully');
  } catch (err) {
    console.error('Upload resume error:', err);
    return error(res, err.message || 'Failed to upload resume', 500);
  }
};

// @desc    Get eligible jobs for student
// @route   GET /api/student/jobs
// @access  Private (student)
exports.getEligibleJobs = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return error(res, 'Student profile not found', 404);
    }

    // Build eligibility query — handle null/undefined student fields gracefully
    const query = {
      status: 'open',
      // Deadline: include jobs with no deadline OR deadline in the future
      $or: [
        { deadline: null },
        { deadline: { $exists: false } },
        { deadline: { $gte: new Date() } }
      ],
      minCGPA: { $lte: student.cgpa || 0 },
      maxBacklogs: { $gte: student.activeBacklogs || 0 }
    };

    // Branch filter: only apply if student has a branch set
    if (student.branch) {
      query.$and = [
        { $or: [
          { eligibleBranches: { $size: 0 } },
          { eligibleBranches: { $exists: false } },
          { eligibleBranches: student.branch }
        ]}
      ];
    }

    // Need to merge $or into $and if branch filter exists
    if (query.$and) {
      const deadlineOr = query.$or;
      delete query.$or;
      query.$and.push({ $or: deadlineOr });
    }

    const jobs = await Job.find(query).populate('company', 'name logo tier location');

    // Exclude jobs already applied to
    const appliedJobIds = await Application.find({ student: student._id }).distinct('job');
    const filteredJobs = jobs.filter(j => !appliedJobIds.some(id => id.equals(j._id)));

    return success(res, filteredJobs, 'Eligible jobs fetched');
  } catch (err) {
    console.error('Get eligible jobs error:', err);
    return error(res, 'Failed to fetch jobs', 500);
  }
};

// @desc    Apply to a job
// @route   POST /api/student/apply/:jobId
// @access  Private (student)
exports.applyToJob = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return error(res, 'Student profile not found', 404);
    }

    // Bug Fix 1: Block placed students from applying to more jobs
    if (student.placementStatus === 'placed') {
      return error(res, 'You are already placed and cannot apply to more drives.', 400);
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return error(res, 'Job not found', 404);
    }

    if (job.status !== 'open') {
      return error(res, 'This job is no longer accepting applications', 400);
    }

    if (job.deadline && new Date() > job.deadline) {
      return error(res, 'Application deadline has passed', 400);
    }

    // Re-check eligibility on server
    if (job.minCGPA && (student.cgpa || 0) < job.minCGPA) {
      return error(res, 'You do not meet the minimum CGPA requirement', 400);
    }

    if (job.maxBacklogs !== undefined && (student.activeBacklogs || 0) > job.maxBacklogs) {
      return error(res, 'You exceed the maximum backlogs allowed', 400);
    }

    if (job.eligibleBranches && job.eligibleBranches.length > 0 && !job.eligibleBranches.includes(student.branch)) {
      return error(res, 'Your branch is not eligible for this job', 400);
    }

    // Check duplicate application
    const existingApp = await Application.findOne({ student: student._id, job: job._id });
    if (existingApp) {
      return error(res, 'You have already applied to this job', 400);
    }

    const application = await Application.create({
      student: student._id,
      job: job._id,
      company: job.company,
      resumeUrl: student.resumeUrl,
      status: 'applied'
    });

    // Create notification
    await Notification.create({
      user: req.user._id,
      title: 'Application Submitted',
      message: `Your application for "${job.title}" has been submitted successfully.`,
      type: 'application_update',
      link: `/student/applications`
    });

    return success(res, application, 'Application submitted successfully', 201);
  } catch (err) {
    console.error('Apply to job error:', err);
    if (err.code === 11000) {
      return error(res, 'You have already applied to this job', 400);
    }
    return error(res, 'Failed to submit application', 500);
  }
};

// @desc    Get student's applications
// @route   GET /api/student/applications
// @access  Private (student)
exports.getApplications = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return error(res, 'Student profile not found', 404);
    }

    const applications = await Application.find({ student: student._id })
      .populate({
        path: 'job',
        select: 'title jobType package stipend location deadline status',
        populate: { path: 'company', select: 'name logo' }
      })
      .populate('company', 'name logo')
      .sort({ createdAt: -1 });

    return success(res, applications, 'Applications fetched');
  } catch (err) {
    console.error('Get applications error:', err);
    return error(res, 'Failed to fetch applications', 500);
  }
};

// @desc    Withdraw application
// @route   PUT /api/student/applications/:id/withdraw
// @access  Private (student)
exports.withdrawApplication = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return error(res, 'Student profile not found', 404);
    }

    const application = await Application.findOne({
      _id: req.params.id,
      student: student._id
    });

    if (!application) {
      return error(res, 'Application not found', 404);
    }

    if (['selected', 'rejected', 'withdrawn'].includes(application.status)) {
      return error(res, 'Cannot withdraw this application', 400);
    }

    application.status = 'withdrawn';
    await application.save();

    return success(res, application, 'Application withdrawn');
  } catch (err) {
    console.error('Withdraw application error:', err);
    return error(res, 'Failed to withdraw application', 500);
  }
};

// @desc    Get student's interview schedule
// @route   GET /api/student/interviews
// @access  Private (student)
exports.getInterviews = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return error(res, 'Student profile not found', 404);
    }

    const interviews = await Interview.find({ student: student._id })
      .populate('job', 'title')
      .populate('company', 'name logo')
      .sort({ scheduledAt: 1 });

    return success(res, interviews, 'Interviews fetched');
  } catch (err) {
    console.error('Get interviews error:', err);
    return error(res, 'Failed to fetch interviews', 500);
  }
};

// @desc    Get student dashboard stats
// @route   GET /api/student/dashboard
// @access  Private (student)
exports.getDashboard = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id })
      .populate('user', 'name email profileImageUrl')
      .populate('placedIn', 'name logo');

    if (!student) {
      return error(res, 'Student profile not found', 404);
    }

    const applications = await Application.find({ student: student._id });
    const interviews = await Interview.find({
      student: student._id,
      status: 'scheduled',
      scheduledAt: { $gte: new Date() }
    }).populate('job', 'title').populate('company', 'name').sort({ scheduledAt: 1 }).limit(5);

    const stats = {
      totalApplications: applications.length,
      applied: applications.filter(a => a.status === 'applied').length,
      shortlisted: applications.filter(a => a.status === 'shortlisted').length,
      interviews: applications.filter(a => a.status === 'interview').length,
      selected: applications.filter(a => a.status === 'selected').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
    };

    const offers = applications.filter(a => a.status === 'selected');

    return success(res, {
      student,
      stats,
      upcomingInterviews: interviews,
      offers
    }, 'Dashboard fetched');
  } catch (err) {
    console.error('Get dashboard error:', err);
    return error(res, 'Failed to fetch dashboard', 500);
  }
};
