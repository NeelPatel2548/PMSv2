const express = require('express');
const router = express.Router();
const {
  getStats,
  getPublicCompanies,
  getPublicJobs,
  getSkills
} = require('../controllers/publicController');

// All public routes — no auth required
router.get('/stats', getStats);
router.get('/companies', getPublicCompanies);
router.get('/jobs', getPublicJobs);
router.get('/skills', getSkills);

module.exports = router;
