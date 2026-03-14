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

// Unique compound index: one application per student per job
applicationSchema.index({ student: 1, job: 1 }, { unique: true });

// Individual indexes
applicationSchema.index({ student: 1 });
applicationSchema.index({ job: 1 });
applicationSchema.index({ company: 1 });
applicationSchema.index({ status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
