const mongoose = require('mongoose');
const { SKILLS_LIST } = require('../utils/constants');

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true         // ← creates unique index on user automatically
  },
  enrollmentNo: {
    type: String,
    unique: true,
    sparse: true,        // allows multiple null values
    trim: true
  },
  branch: {
    type: String,
    enum: ['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'Other']
  },
  phone: {
    type: String,
    match: [/^[6-9]\d{9}$/, 'Invalid phone number']
  },
  dob: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  address: {
    type: String
  },
  passingYear: {
    type: Number,
    min: 2020,
    max: 2030
  },
  currentSemester: {
    type: Number,
    min: 1,
    max: 8
  },
  tenthPercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  twelfthPercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  cgpa: {
    type: Number,
    min: 0,
    max: 10
  },
  activeBacklogs: {
    type: Number,
    default: 0,
    min: 0
  },
  skills: [{
    type: String,
    trim: true,
    validate: {
      validator: function(skill) {
        return SKILLS_LIST.includes(skill);
      },
      message: props => `"${props.value}" is not a valid skill. Must be one of the predefined skills list.`
    }
  }],
  projects: [{
    title: { type: String },
    description: { type: String },
    link: { type: String }
  }],
  certifications: [{
    title: { type: String },
    issuedBy: { type: String },
    year: { type: Number },
    link: { type: String }
  }],
  internshipExperience: {
    type: String
  },
  linkedin: {
    type: String,
    match: [/^https?:\/\/.+/, 'Must be a valid URL']
  },
  github: {
    type: String,
    match: [/^https?:\/\/.+/, 'Must be a valid URL']
  },
  resumeUrl: {
    type: String,
    default: null
  },
  profilePicture: { // NEW — student headshot stored in Cloudinary pms-profile-pictures/
    url: { type: String, default: null },       // Cloudinary secure_url for display
    publicId: { type: String, default: null }   // Cloudinary public_id for deletion on replace
  },
  placementStatus: {
    type: String,
    default: 'unplaced',
    enum: ['placed', 'unplaced']
  },
  placedIn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null
  },
  academicVerified: {
    type: Boolean,
    default: false
  },
  academicVerifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  academicVerifiedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

// user: unique index is already created by the `unique: true` field option above.
// DO NOT duplicate it here.

// Compound eligibility filter index — the most critical index in the system.
// Used by job application eligibility checks:
//   Student.find({ cgpa: { $gte: minCGPA }, branch: { $in: eligibleBranches }, activeBacklogs: 0 })
// Field order matters: put the highest-cardinality / most-selective field first.
// cgpa (continuous range) → branch (low cardinality enum) → activeBacklogs (usually 0)
studentSchema.index({ cgpa: 1, branch: 1, activeBacklogs: 1 });

// placementStatus: admin report generation — "show all unplaced students"
// Query: Student.find({ placementStatus: 'unplaced' })
studentSchema.index({ placementStatus: 1 });

// academicVerified: admin verification queue — "show unverified students"
// Query: Student.find({ academicVerified: false })
studentSchema.index({ academicVerified: 1 });

// passingYear: batch-level filters for admin reports & eligibility
// Query: Student.find({ passingYear: 2025 })
studentSchema.index({ passingYear: 1 });

module.exports = mongoose.model('Student', studentSchema);
