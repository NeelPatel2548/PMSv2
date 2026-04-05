const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getDashboard,
  getStudents,
  getStudent,
  updateStudentAcademic,
  verifyStudentAcademic,
  getCompanies,
  getCompany,
  approveCompany,
  updateCompany,
  getJobs,
  updateJob,
  deleteUser,
  toggleUserStatus,
  createAnnouncement,
  generateReport,
  getReports
} = require('../controllers/adminController');

// All routes require authentication + admin role
router.use(protect, authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboard);

// Students — view only, suspend/unsuspend, delete
router.get('/students', getStudents);
router.get('/students/:id', getStudent);
router.put('/students/:id/academic', updateStudentAcademic);
router.put('/students/:id/verify-academic', verifyStudentAcademic);

// Companies
router.get('/companies', getCompanies);
router.get('/companies/:id', getCompany);
router.put('/companies/:id', [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('tier').optional().isIn(['tier1', 'tier2', 'mass_recruiter']).withMessage('Invalid tier'),
], updateCompany);
router.put('/companies/:id/approve', [
  body('isApproved').isBoolean().withMessage('isApproved must be boolean'),
], approveCompany);

// Jobs
router.get('/jobs', getJobs);
router.put('/jobs/:id', updateJob);

// Users
router.delete('/users/:id', deleteUser);
router.put('/users/:id/status', [
  body('isActive').isBoolean().withMessage('isActive must be boolean'),
], toggleUserStatus);

// Announcements
router.post('/announcements', [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('targetRole').optional().isIn(['student', 'company', 'admin', 'all']).withMessage('Invalid target role'),
], createAnnouncement);

// Reports
router.get('/reports', getReports);
router.post('/reports', [
  body('academicYear').trim().notEmpty().withMessage('Academic year is required'),
], generateReport);

module.exports = router;
