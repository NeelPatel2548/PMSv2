const express = require('express');
const router = express.Router();
const {
  getStats,
  getPublicCompanies,
  getPublicJobs
} = require('../controllers/publicController');

// All public routes — no auth required
router.get('/stats', getStats);
router.get('/companies', getPublicCompanies);
router.get('/jobs', getPublicJobs);

module.exports = router;
