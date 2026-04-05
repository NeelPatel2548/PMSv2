const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/authMiddleware');
const { companyLogoUpload } = require('../middleware/upload'); // NEW
const {
  getProfile,
  updateProfile,
  uploadCompanyLogo, // NEW
  postJob,
  getJobs,
  getJob,
  updateJob,
  toggleJobStatus,
  getApplicants,
  updateApplicationStatus,
  scheduleInterview,
  submitRoundResult,
  getDashboard
} = require('../controllers/companyController');

// All routes require authentication + company role
router.use(protect, authorize('company'));

// Dashboard
router.get('/dashboard', getDashboard);

// Profile
router.get('/profile', getProfile);
router.put('/profile', [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('website').optional().matches(/^https?:\/\/.+/).withMessage('Must be a valid URL'),
  body('hrEmail').optional().isEmail().withMessage('Invalid HR email'),
], updateProfile);

// Logo upload // NEW
router.post('/profile/logo', companyLogoUpload.single('logo'), uploadCompanyLogo); // NEW

// Jobs
router.get('/jobs', getJobs);
router.post('/jobs', [
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('jobType').isIn(['fulltime', 'internship']).withMessage('Job type must be fulltime or internship'),
  body('minCGPA').optional().isFloat({ min: 0, max: 10 }).withMessage('CGPA must be between 0 and 10'),
  body('maxBacklogs').optional().isInt({ min: 0 }).withMessage('Max backlogs must be a non-negative integer'),
  body('openings').optional().isInt({ min: 1 }).withMessage('Openings must be at least 1'),
], postJob);
router.get('/jobs/:id', getJob);
router.put('/jobs/:id', [
  body('title').optional().trim().notEmpty().withMessage('Job title cannot be empty'),
  body('jobType').optional().isIn(['fulltime', 'internship']).withMessage('Invalid job type'),
], updateJob);
router.patch('/jobs/:id/status', toggleJobStatus);

// Applicants
router.get('/jobs/:id/applicants', getApplicants);
router.put('/applications/:id/status', [
  body('status').isIn(['applied', 'shortlisted', 'interview', 'selected', 'rejected'])
    .withMessage('Invalid status'),
], updateApplicationStatus);

// Interviews
router.post('/interviews', [
  body('applicationId').notEmpty().withMessage('Application ID is required'),
  body('roundName').trim().notEmpty().withMessage('Round name is required'),
  body('roundNumber').isInt({ min: 1 }).withMessage('Round number must be at least 1'),
  body('scheduledAt').isISO8601().withMessage('Scheduled date must be valid'),
  body('mode').isIn(['online', 'offline']).withMessage('Mode must be online or offline'),
], scheduleInterview);
router.put('/interviews/:id/result', [
  body('result').isIn(['pass', 'fail']).withMessage('Result must be pass or fail'),
], submitRoundResult);

module.exports = router;
