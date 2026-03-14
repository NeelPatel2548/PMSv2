const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  enrollmentNo: {
    type: String,
    unique: true,
    sparse: true,
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
    trim: true
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
  placementStatus: {
    type: String,
    default: 'unplaced',
    enum: ['placed', 'unplaced']
  },
  placedIn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null
  }
}, { timestamps: true });

// Indexes
studentSchema.index({ branch: 1 });
studentSchema.index({ cgpa: 1 });
studentSchema.index({ placementStatus: 1 });
studentSchema.index({ passingYear: 1 });

module.exports = mongoose.model('Student', studentSchema);
