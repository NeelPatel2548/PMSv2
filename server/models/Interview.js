const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  roundName: {
    type: String,
    required: [true, 'Round name is required']
  },
  roundNumber: {
    type: Number,
    required: [true, 'Round number is required']
  },
  scheduledAt: {
    type: Date
  },
  mode: {
    type: String,
    enum: ['online', 'offline']
  },
  venue: {
    type: String
  },
  meetingLink: {
    type: String
  },
  status: {
    type: String,
    default: 'scheduled',
    enum: ['scheduled', 'completed', 'cancelled']
  },
  result: {
    type: String,
    enum: ['pass', 'fail', 'pending'],
    default: 'pending'
  },
  feedback: {
    type: String
  }
}, { timestamps: true });

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

// application: look up all rounds for an application
// Query: Interview.find({ application: applicationId })
interviewSchema.index({ application: 1 });

// student: student's interview schedule
// Query: Interview.find({ student: studentId })
interviewSchema.index({ student: 1 });

// company: company's interview schedule
// Query: Interview.find({ company: companyId })
interviewSchema.index({ company: 1 });

// scheduledAt: upcoming interviews sorted chronologically
// Query: Interview.find({ status: 'scheduled' }).sort({ scheduledAt: 1 })
// Also used for date-range queries (interviews this week)
interviewSchema.index({ scheduledAt: 1 });

module.exports = mongoose.model('Interview', interviewSchema);
