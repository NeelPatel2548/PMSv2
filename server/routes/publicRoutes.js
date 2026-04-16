const express = require('express');
const router = express.Router();
const {
  getStats,
  getPublicCompanies,
  getPublicJobs,
  getSkills,
  getPublicSettings,
  submitContactForm
} = require('../controllers/publicController');

router.get('/stats', getStats);
router.get('/companies', getPublicCompanies);
router.get('/jobs', getPublicJobs);
router.get('/skills', getSkills);

// Public settings (no auth) — serves contactEmail, companyName, phone, address, logoUrl
router.get('/settings', getPublicSettings);

// Contact form submission (no auth) — sends email to admin
router.post('/contact', submitContactForm);

module.exports = router;
