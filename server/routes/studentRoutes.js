const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/upload');
const {
  getProfile,
  updateProfile,
  uploadResume,
  getEligibleJobs,
  applyToJob,
  getApplications,
  withdrawApplication,
  getInterviews,
  getDashboard
} = require('../controllers/studentController');

// All routes require authentication + student role
router.use(protect, authorize('student'));

// Dashboard
router.get('/dashboard', getDashboard);

// Profile
router.get('/profile', getProfile);
router.put('/profile', [
  body('phone').optional().matches(/^[6-9]\d{9}$/).withMessage('Invalid phone number'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('linkedin').optional().matches(/^https?:\/\/.+/).withMessage('Must be a valid URL'),
  body('github').optional().matches(/^https?:\/\/.+/).withMessage('Must be a valid URL'),
], updateProfile);

// Resume upload
router.post('/resume', upload.single('resume'), uploadResume);

// Jobs
router.get('/jobs', getEligibleJobs);
router.post('/apply/:jobId', applyToJob);

// Applications
router.get('/applications', getApplications);
router.put('/applications/:id/withdraw', withdrawApplication);

// Interviews
router.get('/interviews', getInterviews);

module.exports = router;
