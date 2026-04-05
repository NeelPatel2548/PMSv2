const { validationResult } = require('express-validator');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Student = require('../models/Student');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { success, error } = require('../utils/apiResponse');
const { deleteFromCloudinary } = require('../middleware/upload'); // NEW

// @desc    Get company profile
// @route   GET /api/company/profile
// @access  Private (company)
exports.getProfile = async (req, res) => {
  try {
    const company = await Company.findOne({ user: req.user._id })
      .populate('user', 'name email profileImageUrl profileCompleted');

    if (!company) {
      return error(res, 'Company profile not found', 404);
    }

    return success(res, company, 'Profile fetched');
  } catch (err) {
    console.error('Get company profile error:', err);
    return error(res, 'Failed to fetch profile', 500);
  }
};

// @desc    Update company profile
// @route   PUT /api/company/profile
// @access  Private (company)
exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed', 400, errors.array());
    }

    // logo is updated via its own dedicated POST route, not here
    const allowed = ['name', 'industry', 'location', 'website', 'description',
                     'hrName', 'hrEmail', 'hrPhone'];
    // CHANGED — removed 'logo' from allowed fields (now uses structured object via dedicated route)
    const updates = {};
    allowed.forEach(key => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const company = await Company.findOneAndUpdate(
      { user: req.user._id },
      updates,
      { returnDocument: 'after', runValidators: true }
    ).populate('user', 'name email profileImageUrl profileCompleted');

    if (!company) {
      return error(res, 'Company profile not found', 404);
    }

    // Mark profile as completed
    const isComplete = company.name && company.industry && company.location;
    if (isComplete) {
      await User.findByIdAndUpdate(req.user._id, { profileCompleted: true });
    }

    return success(res, company, 'Profile updated');
  } catch (err) {
    console.error('Update company profile error:', err);
    return error(res, 'Failed to update profile', 500);
  }
};

// @desc    Upload company logo // NEW
// @route   POST /api/company/profile/logo // NEW
// @access  Private (company) // NEW
exports.uploadCompanyLogo = async (req, res) => { // NEW
  try { // NEW
    if (!req.file) { // NEW
      return error(res, 'No logo file provided', 400); // NEW
    } // NEW

    const company = await Company.findOne({ user: req.user._id }); // NEW
    if (!company) { // NEW
      return error(res, 'Company profile not found', 404); // NEW
    } // NEW

    // Delete the OLD logo from Cloudinary before saving the new one
    if (company.logo?.publicId) { // NEW
      await deleteFromCloudinary(company.logo.publicId, 'image'); // NEW
    } // NEW

    // multer-storage-cloudinary: secure_url → req.file.path, public_id → req.file.filename
    company.logo = { // NEW
      url: req.file.path,       // Cloudinary secure_url // NEW
      publicId: req.file.filename // Cloudinary public_id // NEW
    }; // NEW
    await company.save(); // NEW

    return success(res, { logo: company.logo }, 'Company logo uploaded successfully'); // NEW
  } catch (err) { // NEW
    console.error('Upload company logo error:', err); // NEW
    return error(res, err.message || 'Failed to upload logo', 500); // NEW
  } // NEW
}; // NEW

// @desc    Post a new job
// @route   POST /api/company/jobs
// @access  Private (company)
exports.postJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed', 400, errors.array());
    }

    const company = await Company.findOne({ user: req.user._id });
    if (!company) {
      return error(res, 'Company profile not found', 404);
    }

    if (!company.isApproved) {
      return error(res, 'Company must be approved by admin before posting jobs', 403);
    }

    const jobData = {
      company: company._id,
      title: req.body.title,
      description: req.body.description,
      requiredSkills: req.body.requiredSkills || [],
      package: req.body.package,
      jobType: req.body.jobType,
      stipend: req.body.stipend,
      bondPeriod: req.body.bondPeriod,
      location: req.body.location,
      minCGPA: req.body.minCGPA || 0,
      maxBacklogs: req.body.maxBacklogs || 0,
      eligibleBranches: req.body.eligibleBranches || [],
      openings: req.body.openings || 1,
      deadline: req.body.deadline,
      status: req.body.status || 'open'
    };

    const job = await Job.create(jobData);

    // Notify eligible students
    const eligibleStudents = await Student.find({
      cgpa: { $gte: job.minCGPA },
      activeBacklogs: { $lte: job.maxBacklogs },
      ...(job.eligibleBranches.length > 0 ? { branch: { $in: job.eligibleBranches } } : {})
    }).populate('user', '_id');

    const notifications = eligibleStudents.map(s => ({
      user: s.user._id,
      title: 'New Job Posted',
      message: `${company.name} has posted a new ${job.jobType} role: "${job.title}"`,
      type: 'job_posted',
      link: `/student/jobs`
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    return success(res, job, 'Job posted successfully', 201);
  } catch (err) {
    console.error('Post job error:', err);
    return error(res, 'Failed to post job', 500);
  }
};

// @desc    Get company's jobs
// @route   GET /api/company/jobs
// @access  Private (company)
exports.getJobs = async (req, res) => {
  try {
    const company = await Company.findOne({ user: req.user._id });
    if (!company) {
      return error(res, 'Company profile not found', 404);
    }

    const jobs = await Job.find({ company: company._id }).sort({ createdAt: -1 });

    return success(res, jobs, 'Jobs fetched');
  } catch (err) {
    console.error('Get company jobs error:', err);
    return error(res, 'Failed to fetch jobs', 500);
  }
};

// @desc    Update a job
// @route   PUT /api/company/jobs/:id
// @access  Private (company)
exports.updateJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed', 400, errors.array());
    }

    const company = await Company.findOne({ user: req.user._id });
    if (!company) {
      return error(res, 'Company profile not found', 404);
    }

    const job = await Job.findOne({ _id: req.params.id, company: company._id });
    if (!job) {
      return error(res, 'Job not found', 404);
    }

    // Status is NOT allowed via PUT — use PATCH /status instead
    const allowed = ['title', 'description', 'requiredSkills', 'package', 'jobType',
                     'stipend', 'bondPeriod', 'location', 'minCGPA', 'maxBacklogs',
                     'eligibleBranches', 'openings', 'deadline'];
    const updates = {};
    allowed.forEach(key => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      updates,
      { returnDocument: 'after', runValidators: true }
    );

    return success(res, updatedJob, 'Job updated');
  } catch (err) {
    console.error('Update job error:', err);
    return error(res, 'Failed to update job', 500);
  }
};

// @desc    Get single job details
// @route   GET /api/company/jobs/:id
// @access  Private (company)
exports.getJob = async (req, res) => {
  try {
    const company = await Company.findOne({ user: req.user._id });
    if (!company) {
      return error(res, 'Company profile not found', 404);
    }

    const job = await Job.findOne({ _id: req.params.id, company: company._id });
    if (!job) {
      return error(res, 'Job not found', 404);
    }

    const applicationCount = await Application.countDocuments({ job: job._id });

    return success(res, { ...job.toObject(), applicationCount }, 'Job fetched');
  } catch (err) {
    console.error('Get job error:', err);
    return error(res, 'Failed to fetch job', 500);
  }
};

// @desc    Toggle job status (open/closed) with bulk application handling
// @route   PATCH /api/company/jobs/:id/status
// @access  Private (company)
exports.toggleJobStatus = async (req, res) => {
  try {
    const company = await Company.findOne({ user: req.user._id });
    if (!company) {
      return error(res, 'Company profile not found', 404);
    }

    const job = await Job.findOne({ _id: req.params.id, company: company._id });
    if (!job) {
      return error(res, 'Job not found', 404);
    }

    if (job.status === 'open') {
      // Closing: bulk reject all pending applications
      const affectedApps = await Application.find({
        job: job._id,
        status: { $in: ['applied', 'shortlisted'] }
      }).populate({ path: 'student', populate: { path: 'user', select: '_id' } });

      await Application.updateMany(
        { job: job._id, status: { $in: ['applied', 'shortlisted'] } },
        { status: 'rejected', remarks: 'Job was closed by company' }
      );

      // Notify affected students
      const notifications = affectedApps
        .filter(a => a.student?.user?._id)
        .map(a => ({
          user: a.student.user._id,
          title: 'Application Closed',
          message: `The job "${job.title}" at ${company.name} has been closed. Your application was rejected.`,
          type: 'application_update',
          link: '/student/applications'
        }));
      if (notifications.length > 0) await Notification.insertMany(notifications);

      job.status = 'closed';
    } else {
      job.status = 'open';
    }

    await job.save();
    return success(res, job, `Job ${job.status === 'open' ? 'reopened' : 'closed'}`);
  } catch (err) {
    console.error('Toggle job status error:', err);
    return error(res, 'Failed to toggle job status', 500);
  }
};

// @desc    Get applicants for a job
// @route   GET /api/company/jobs/:id/applicants
// @access  Private (company)
exports.getApplicants = async (req, res) => {
  try {
    const company = await Company.findOne({ user: req.user._id });
    if (!company) {
      return error(res, 'Company profile not found', 404);
    }

    const job = await Job.findOne({ _id: req.params.id, company: company._id });
    if (!job) {
      return error(res, 'Job not found', 404);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { job: job._id };
    const total = await Application.countDocuments(query);
    const results = await Application.find(query)
      .populate({
        path: 'student',
<<<<<<< HEAD
        select: 'enrollmentNo branch cgpa phone skills resumeUrl activeBacklogs placementStatus passingYear',
=======
        select: 'enrollmentNo branch cgpa phone skills resumeUrl activeBacklogs placementStatus passingYear profilePicture', // NEW — added profilePicture
>>>>>>> main
        populate: { path: 'user', select: 'name email profileImageUrl' }
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return success(res, {
      results,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    }, 'Applicants fetched');
  } catch (err) {
    console.error('Get applicants error:', err);
    return error(res, 'Failed to fetch applicants', 500);
  }
};

// @desc    Update application status (shortlist, reject, select)
// @route   PUT /api/company/applications/:id/status
// @access  Private (company)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed', 400, errors.array());
    }

    const { status, remarks, offeredPackage, offerLetterUrl } = req.body;

    const company = await Company.findOne({ user: req.user._id });
    if (!company) {
      return error(res, 'Company profile not found', 404);
    }

    const application = await Application.findOne({
      _id: req.params.id,
      company: company._id
    }).populate('student');

    if (!application) {
      return error(res, 'Application not found', 404);
    }

    application.status = status;
    if (remarks) application.remarks = remarks;
    if (offeredPackage) application.offeredPackage = offeredPackage;
    if (offerLetterUrl) application.offerLetterUrl = offerLetterUrl;

    await application.save();

    // If selected, update student placement status
    if (status === 'selected') {
      await Student.findByIdAndUpdate(application.student._id, {
        placementStatus: 'placed',
        placedIn: company._id
      });

      // Notify student about selection
      const studentDoc = await Student.findById(application.student._id).populate('user', '_id');
      if (studentDoc) {
        await Notification.create({
          user: studentDoc.user._id,
          title: 'Congratulations! You have been selected!',
          message: `You have been selected by ${company.name}${offeredPackage ? ` with a package of ${offeredPackage}` : ''}.`,
          type: 'offer_received',
          link: '/student/applications'
        });
      }
    } else {
      // Notify student about status update
      const studentDoc = await Student.findById(application.student._id).populate('user', '_id');
      if (studentDoc) {
        await Notification.create({
          user: studentDoc.user._id,
          title: 'Application Status Updated',
          message: `Your application status has been updated to "${status}".`,
          type: 'application_update',
          link: '/student/applications'
        });
      }
    }

    return success(res, application, 'Application status updated');
  } catch (err) {
    console.error('Update application status error:', err);
    return error(res, 'Failed to update application status', 500);
  }
};

// @desc    Schedule an interview round
// @route   POST /api/company/interviews
// @access  Private (company)
exports.scheduleInterview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed', 400, errors.array());
    }

    const company = await Company.findOne({ user: req.user._id });
    if (!company) {
      return error(res, 'Company profile not found', 404);
    }

    const { applicationId, roundName, roundNumber, scheduledAt, mode, venue, meetingLink } = req.body;

    const application = await Application.findOne({
      _id: applicationId,
      company: company._id
    });

    if (!application) {
      return error(res, 'Application not found', 404);
    }

    const interview = await Interview.create({
      application: application._id,
      student: application.student,
      company: company._id,
      job: application.job,
      roundName,
      roundNumber,
      scheduledAt,
      mode,
      venue,
      meetingLink
    });

    // Update application status to interview and current round
    application.status = 'interview';
    application.currentRound = roundName;
    await application.save();

    // Notify student
    const studentDoc = await Student.findById(application.student).populate('user', '_id');
    if (studentDoc) {
      await Notification.create({
        user: studentDoc.user._id,
        title: 'Interview Scheduled',
        message: `Interview round "${roundName}" has been scheduled by ${company.name} on ${new Date(scheduledAt).toLocaleDateString()}.`,
        type: 'interview_scheduled',
        link: '/student/interviews'
      });
    }

    return success(res, interview, 'Interview scheduled', 201);
  } catch (err) {
    console.error('Schedule interview error:', err);
    return error(res, 'Failed to schedule interview', 500);
  }
};

// @desc    Submit interview round result
// @route   PUT /api/company/interviews/:id/result
// @access  Private (company)
exports.submitRoundResult = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed', 400, errors.array());
    }

    const { result, feedback } = req.body;

    const company = await Company.findOne({ user: req.user._id });
    if (!company) {
      return error(res, 'Company profile not found', 404);
    }

    const interview = await Interview.findOne({
      _id: req.params.id,
      company: company._id
    });

    if (!interview) {
      return error(res, 'Interview not found', 404);
    }

    interview.result = result;
    interview.feedback = feedback;
    interview.status = 'completed';
    await interview.save();

    // If result is fail, update application to rejected
    if (result === 'fail') {
      await Application.findByIdAndUpdate(interview.application, {
        status: 'rejected',
        remarks: `Failed at ${interview.roundName}`
      });
    }

    // Notify student
    const studentDoc = await Student.findById(interview.student).populate('user', '_id');
    if (studentDoc) {
      await Notification.create({
        user: studentDoc.user._id,
        title: 'Interview Result',
        message: `Your ${interview.roundName} round result: ${result === 'pass' ? 'Passed ✅' : 'Not selected ❌'}`,
        type: 'application_update',
        link: '/student/interviews'
      });
    }

    return success(res, interview, 'Round result submitted');
  } catch (err) {
    console.error('Submit round result error:', err);
    return error(res, 'Failed to submit result', 500);
  }
};

// @desc    Get company dashboard stats
// @route   GET /api/company/dashboard
// @access  Private (company)
exports.getDashboard = async (req, res) => {
  try {
    const company = await Company.findOne({ user: req.user._id })
      .populate('user', 'name email profileImageUrl');

    if (!company) {
      return error(res, 'Company profile not found', 404);
    }

    const jobs = await Job.find({ company: company._id });
    const jobIds = jobs.map(j => j._id);
    const applications = await Application.find({ job: { $in: jobIds } });

    const stats = {
      totalJobs: jobs.length,
      openJobs: jobs.filter(j => j.status === 'open').length,
      closedJobs: jobs.filter(j => j.status === 'closed').length,
      totalApplications: applications.length,
      shortlisted: applications.filter(a => a.status === 'shortlisted').length,
      selected: applications.filter(a => a.status === 'selected').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
    };

    return success(res, { company, stats, recentJobs: jobs.slice(0, 5) }, 'Dashboard fetched');
  } catch (err) {
    console.error('Get company dashboard error:', err);
    return error(res, 'Failed to fetch dashboard', 500);
  }
};

// @desc    Export applicants for a job as CSV
// @route   GET /api/company/jobs/:id/export
// @access  Private (company)
exports.exportApplicantsCSV = async (req, res) => {
  try {
    const company = await Company.findOne({ user: req.user._id });
    if (!company) return error(res, 'Company profile not found', 404);

    const job = await Job.findOne({ _id: req.params.id, company: company._id });
    if (!job) return error(res, 'Job not found', 404);

    const applications = await Application.find({ job: job._id })
      .populate({
        path: 'student',
        select: 'enrollmentNo branch cgpa passingYear phone skills activeBacklogs tenthPercentage twelfthPercentage',
        populate: { path: 'user', select: 'name email' }
      })
      .sort('-createdAt');

    // CSV helper — escape fields with commas/quotes
    const esc = (val) => {
      if (val == null) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Build CSV
    const headers = [
      'Name', 'Email', 'Enrollment No', 'Branch', 'CGPA', 'Passing Year',
      'Phone', 'Skills', '10th %', '12th %', 'Active Backlogs',
      'Status', 'Offer Status', 'Offered Package', 'Applied On'
    ];

    const rows = applications.map(app => [
      esc(app.student?.user?.name),
      esc(app.student?.user?.email),
      esc(app.student?.enrollmentNo),
      esc(app.student?.branch),
      esc(app.student?.cgpa),
      esc(app.student?.passingYear),
      esc(app.student?.phone),
      esc((app.student?.skills || []).join('; ')),
      esc(app.student?.tenthPercentage),
      esc(app.student?.twelfthPercentage),
      esc(app.student?.activeBacklogs),
      esc(app.status),
      esc(app.offerStatus || 'N/A'),
      esc(app.offeredPackage || 'N/A'),
      esc(app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '')
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const filename = `${job.title.replace(/[^a-zA-Z0-9]/g, '_')}_applicants_${Date.now()}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csv);
  } catch (err) {
    console.error('Export applicants CSV error:', err);
    return error(res, 'Failed to export applicants', 500);
  }
};
