const mongoose = require('mongoose');
const { SKILLS_LIST } = require('../utils/constants');

const jobSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  description: {
    type: String
  },
  requiredSkills: [{
    type: String,
    enum: SKILLS_LIST
  }],
  package: {
    type: String
  },
  jobType: {
    type: String,
    required: [true, 'Job type is required'],
    enum: ['fulltime', 'internship']
  },
  stipend: {
    type: String
  },
  bondPeriod: {
    type: String
  },
  location: {
    type: String
  },
  minCGPA: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  maxBacklogs: {
    type: Number,
    default: 0,
    min: 0
  },
  eligibleBranches: [{
    type: String
  }],
  openings: {
    type: Number,
    default: 1,
    min: 1
  },
  deadline: {
    type: Date
  },
  status: {
    type: String,
    default: 'open',
    enum: ['open', 'closed', 'draft']
  }
}, { timestamps: true });

// Indexes
jobSchema.index({ company: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ minCGPA: 1 });
jobSchema.index({ deadline: 1 });

module.exports = mongoose.model('Job', jobSchema);
