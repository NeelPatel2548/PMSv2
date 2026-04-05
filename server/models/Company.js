const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true         // ← creates unique index on user automatically
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
  logo: { // CHANGED — was a plain String; now an object to store Cloudinary publicId for deletion
    url: { type: String, default: null },       // Cloudinary secure_url for display
    publicId: { type: String, default: null }   // Cloudinary public_id for deletion on replace
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

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

// user: unique index is already created by the `unique: true` field option above.
// DO NOT duplicate it here.

// isApproved: admin approval queue — "show pending companies"
// Query: Company.find({ isApproved: false })
companySchema.index({ isApproved: 1 });

// tier: used for filtering companies by recruitment tier in admin reports
// Query: Company.find({ tier: 'tier1' })
companySchema.index({ tier: 1 });

module.exports = mongoose.model('Company', companySchema);
