const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload, profilePictureUpload } = require('../middleware/upload'); // NEW — added profilePictureUpload
const {
  getProfile,
  updateProfile,
  uploadProfilePicture, // NEW
  uploadResume,
  getEligibleJobs,
  applyToJob,
  getApplications,
  withdrawApplication,
  getInterviews,
  getDashboard,
  getOffers,
  respondToOffer
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

// Profile picture upload // NEW
router.post('/profile/picture', profilePictureUpload.single('profilePicture'), uploadProfilePicture); // NEW

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

// Offers
router.get('/offers', getOffers);
router.put('/applications/:id/offer', [
  body('offerStatus').isIn(['accepted', 'declined']).withMessage('offerStatus must be accepted or declined'),
], respondToOffer);

module.exports = router;
