const { validationResult } = require('express-validator');
const Student = require('../models/Student');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Notification = require('../models/Notification');
const { success, error } = require('../utils/apiResponse');
const { deleteCloudinaryFile } = require('../middleware/upload');

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
      const msgs = errors.array().map(e => e.msg).join(', ');
      return error(res, `Validation failed: ${msgs}`, 400, errors.array());
    }

    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return error(res, 'Student profile not found', 404);
    }

    // Whitelist allowed personal fields — always editable
    const personalFields = ['name', 'phone', 'address', 'gender', 'dob',
                     'linkedin', 'github', 'skills',
                     'projects', 'certifications', 'internshipExperience'];
    const academicFields = ['enrollmentNo', 'branch', 'passingYear', 'currentSemester',
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

    // === Feature 1: Server-side validations ===
    const { phone, dob, address, gender } = updates;
    if (phone !== undefined && phone && !/^[0-9]{10}$/.test(phone)) {
      return error(res, 'Phone number must be exactly 10 digits.', 400);
    }
    if (gender !== undefined && gender && !['male', 'female', 'other'].includes(gender)) {
      return error(res, 'Gender must be male, female, or other.', 400);
    }
    if (dob !== undefined && dob) {
      const dobDate = new Date(dob);
      if (isNaN(dobDate.getTime()) || dobDate > new Date()) {
        return error(res, 'Date of birth cannot be in the future.', 400);
      }
    }
    if (address !== undefined && address && address.length < 5) {
      return error(res, 'Address must be at least 5 characters.', 400);
    }
    // Enrollment number validation
    if (updates.enrollmentNo !== undefined && updates.enrollmentNo) {
      const enroll = String(updates.enrollmentNo);
      if (!/^\d{13}$/.test(enroll)) {
        return error(res, 'Enrollment number must be exactly 13 digits.', 400);
      }
    }
    // Academic field validations
    if (updates.cgpa !== undefined && updates.cgpa !== '' && (updates.cgpa < 0 || updates.cgpa > 10)) {
      return error(res, 'CGPA must be between 0 and 10.', 400);
    }
    if (updates.tenthPercentage !== undefined && updates.tenthPercentage !== '' && (updates.tenthPercentage < 0 || updates.tenthPercentage > 100)) {
      return error(res, '10th percentage must be between 0 and 100.', 400);
    }
    if (updates.twelfthPercentage !== undefined && updates.twelfthPercentage !== '' && (updates.twelfthPercentage < 0 || updates.twelfthPercentage > 100)) {
      return error(res, '12th percentage must be between 0 and 100.', 400);
    }
    if (updates.passingYear !== undefined && updates.passingYear !== '' && (updates.passingYear < 2020 || updates.passingYear > 2030)) {
      return error(res, 'Passing year must be between 2020 and 2030.', 400);
    }
    if (updates.currentSemester !== undefined && updates.currentSemester !== '' && (updates.currentSemester < 1 || updates.currentSemester > 8)) {
      return error(res, 'Current semester must be between 1 and 8.', 400);
    }

    // Sanitize skills: only allow predefined values
    if (updates.skills) {
      const { SKILLS_LIST } = require('../utils/constants');
      updates.skills = updates.skills.filter(s => SKILLS_LIST.includes(s));
    }

    const updatedStudent = await Student.findOneAndUpdate(
      { user: req.user._id },
      updates,
      { returnDocument: 'after', runValidators: false }
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

    return success(res, final, 'Profile updated successfully');
  } catch (err) {
    console.error('Update profile error:', err);
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const fieldName = field === 'enrollmentNo' ? 'Enrollment number' : field;
      return error(res, `${fieldName} is already registered to another student.`, 400);
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message).join(', ');
      return error(res, `Validation failed: ${messages}`, 400);
    }
    return error(res, err.message || 'Failed to update profile', 500);
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

    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return error(res, 'Student profile not found', 404);
    }

    // Delete old resume from Cloudinary if it exists
    if (student.resumeUrl) {
      await deleteCloudinaryFile(student.resumeUrl);
    }

    // Cloudinary returns the secure URL in req.file.path
    const resumeUrl = req.file.path;

    await Student.findOneAndUpdate(
      { user: req.user._id },
      { resumeUrl },
      { returnDocument: 'after', runValidators: true }
    );

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

    // Feature 3: Skill match scoring
    const studentSkills = student.skills || [];
    const jobsWithScore = filteredJobs.map(job => {
      const jobSkills = job.requiredSkills || [];
      if (jobSkills.length === 0) {
        return { ...job.toObject(), matchScore: 0, matchedSkills: [], unmatchedSkills: [], matchLevel: 'none' };
      }
      const matched = jobSkills.filter(skill => studentSkills.includes(skill));
      const matchScore = Math.round((matched.length / jobSkills.length) * 100);
      let matchLevel = 'none';
      if (matched.length >= 3) matchLevel = 'strong';
      else if (matched.length >= 1) matchLevel = 'partial';
      return {
        ...job.toObject(),
        matchScore,
        matchedSkills: matched,
        unmatchedSkills: jobSkills.filter(s => !studentSkills.includes(s)),
        matchLevel
      };
    });

    // Sort: strong first, then partial, then none; within same level by score desc
    const levelOrder = { strong: 3, partial: 2, none: 1 };
    jobsWithScore.sort((a, b) => {
      if (levelOrder[b.matchLevel] !== levelOrder[a.matchLevel]) {
        return levelOrder[b.matchLevel] - levelOrder[a.matchLevel];
      }
      return b.matchScore - a.matchScore;
    });

    return success(res, jobsWithScore, 'Eligible jobs fetched');
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
    const student = await Student.findOne({ user: req.user._id }).populate('user', 'name');
    if (!student) {
      return error(res, 'Student profile not found', 404);
    }

    // Bug Fix 1: Block placed students from applying to more jobs
    if (student.placementStatus === 'placed') {
      return error(res, 'You are already placed and cannot apply to more drives.', 400);
    }

    // Feature 2: Profile completion gate
    const missingPersonal = [];
    if (!student.user?.name) missingPersonal.push('name');
    if (!student.phone) missingPersonal.push('phone');
    if (!student.gender) missingPersonal.push('gender');
    if (!student.dob) missingPersonal.push('date of birth');
    if (!student.address) missingPersonal.push('address');

    if (missingPersonal.length > 0) {
      return error(res, `Please complete your personal information before applying. Missing: ${missingPersonal.join(', ')}`, 400);
    }

    const missingAcademic = [];
    if (!student.enrollmentNo) missingAcademic.push('enrollment number');
    if (!student.branch) missingAcademic.push('branch');
    if (!student.cgpa && student.cgpa !== 0) missingAcademic.push('CGPA');
    if (!student.tenthPercentage) missingAcademic.push('10th percentage');
    if (!student.twelfthPercentage) missingAcademic.push('12th percentage');
    if (!student.passingYear) missingAcademic.push('passing year');
    if (!student.currentSemester) missingAcademic.push('current semester');

    if (missingAcademic.length > 0) {
      return error(res, `Please complete your academic records before applying. Missing: ${missingAcademic.join(', ')}`, 400);
    }

    if (!student.skills || student.skills.length === 0) {
      return error(res, 'Please add at least one skill to your profile before applying.', 400);
    }

    if (!student.academicVerified) {
      return error(res, 'Your academic records must be verified by the administration before you can apply to jobs. Please contact your placement officer.', 400);
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

    // Profile completion score
    const user = student.user;
    let personalScore = 0;
    if (user?.name) personalScore += 5;
    if (student.phone) personalScore += 5;
    if (student.gender) personalScore += 5;
    if (student.dob) personalScore += 5;
    if (student.address) personalScore += 5;

    let academicScore = 0;
    if (student.enrollmentNo) academicScore += 5;
    if (student.branch) academicScore += 5;
    if (student.cgpa !== undefined && student.cgpa !== null) academicScore += 5;
    if (student.tenthPercentage) academicScore += 5;
    if (student.twelfthPercentage) academicScore += 5;
    if (student.passingYear) academicScore += 5;
    if (student.currentSemester) academicScore += 5;

    let skillsScore = 0;
    const skillCount = student.skills?.length || 0;
    if (skillCount >= 5) skillsScore = 15;
    else if (skillCount >= 3) skillsScore = 10;
    else if (skillCount >= 1) skillsScore = 5;

    const verifiedScore = student.academicVerified ? 15 : 0;

    let extrasScore = 0;
    if (student.resumeUrl) extrasScore += 4;
    if (student.linkedin) extrasScore += 3;
    if (student.github) extrasScore += 3;

    const completionScore = personalScore + academicScore + skillsScore + verifiedScore + extrasScore;

    return success(res, {
      student,
      stats,
      upcomingInterviews: interviews,
      offers,
      completionScore,
      completionBreakdown: {
        personal: { score: personalScore, max: 25 },
        academic: { score: academicScore, max: 35 },
        skills: { score: skillsScore, max: 15 },
        verified: { score: verifiedScore, max: 15 },
        extras: { score: extrasScore, max: 10 },
      }
    }, 'Dashboard fetched');
  } catch (err) {
    console.error('Get dashboard error:', err);
    return error(res, 'Failed to fetch dashboard', 500);
  }
};
