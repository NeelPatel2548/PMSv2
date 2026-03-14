const mongoose = require('mongoose');

const placementReportSchema = new mongoose.Schema({
  academicYear: {
    type: String,
    required: [true, 'Academic year is required']
  },
  branch: {
    type: String
  },
  totalStudents: {
    type: Number,
    default: 0
  },
  totalPlaced: {
    type: Number,
    default: 0
  },
  totalApplications: {
    type: Number,
    default: 0
  },
  avgPackage: {
    type: Number,
    default: 0
  },
  maxPackage: {
    type: Number,
    default: 0
  },
  branchWiseStats: [{
    branch: { type: String },
    placed: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  }],
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('PlacementReport', placementReportSchema);
