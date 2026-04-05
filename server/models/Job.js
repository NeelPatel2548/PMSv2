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

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

// company: look up all jobs posted by a company
// Query: Job.find({ company: companyId })
jobSchema.index({ company: 1 });

// Compound: student job listing filter — the primary query students see
// Query: Job.find({ status: 'open', minCGPA: { $lte: studentCGPA } })
// status first (equality / low cardinality), minCGPA second (range)
jobSchema.index({ status: 1, minCGPA: 1 });

// eligibleBranches: multikey index — MongoDB automatically indexes each
// element of the array, enabling fast $in / $elemMatch queries
// Query: Job.find({ eligibleBranches: { $in: ['CSE', 'IT'] } })
jobSchema.index({ eligibleBranches: 1 });

// jobType: students filter by fulltime vs internship
// Query: Job.find({ jobType: 'internship', status: 'open' })
jobSchema.index({ jobType: 1 });

// createdAt descending: "latest jobs first" on the student dashboard
// Query: Job.find({ status: 'open' }).sort({ createdAt: -1 })
jobSchema.index({ createdAt: -1 });

// deadline: background job / admin query for expired listings
// Query: Job.find({ deadline: { $lt: new Date() }, status: 'open' })
jobSchema.index({ deadline: 1 });

module.exports = mongoose.model('Job', jobSchema);
