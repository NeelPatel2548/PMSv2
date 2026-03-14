const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  industry: {
    type: String
  },
  location: {
    type: String
  },
  website: {
    type: String,
    match: [/^https?:\/\/.+/, 'Must be a valid URL']
  },
  description: {
    type: String
  },
  tier: {
    type: String,
    enum: ['tier1', 'tier2', 'mass_recruiter'],
    default: 'tier2'
  },
  hrName: {
    type: String
  },
  hrEmail: {
    type: String,
    lowercase: true
  },
  hrPhone: {
    type: String
  },
  logo: {
    type: String,
    default: null
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Indexes
companySchema.index({ isApproved: 1 });
companySchema.index({ tier: 1 });

module.exports = mongoose.model('Company', companySchema);
