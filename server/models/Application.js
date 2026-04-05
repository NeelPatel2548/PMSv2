const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  resumeUrl: {
    type: String
  },
  status: {
    type: String,
    default: 'applied',
    enum: ['applied', 'shortlisted', 'interview', 'selected', 'rejected', 'withdrawn']
  },
  currentRound: {
    type: String
  },
  remarks: {
    type: String
  },
  offerLetterUrl: {
    type: String,
    default: null
  },
  offeredPackage: {
    type: String,
    default: null
  },
  offerStatus: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'revoked'],
    default: 'pending'
  }
}, { timestamps: true });

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

// CRITICAL: Unique compound index — prevents a student from applying to the
// same job twice. This is a database-level constraint, not just app-level.
// Query: Application.findOne({ student: studentId, job: jobId })
applicationSchema.index({ student: 1, job: 1 }, { unique: true });

// Compound: applicant list by status for a specific job (company/admin view)
// Query: Application.find({ job: jobId, status: 'shortlisted' })
// job first (equality, high selectivity), status second (filter)
applicationSchema.index({ job: 1, status: 1 });

// Compound: student's own application tracker filtered by status
// Query: Application.find({ student: studentId, status: 'applied' })
applicationSchema.index({ student: 1, status: 1 });

// company: admin / company view — all applications for a company
// Query: Application.find({ company: companyId })
applicationSchema.index({ company: 1 });

module.exports = mongoose.model('Application', applicationSchema);
