const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,          // ← creates unique index on email automatically
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false,
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['student', 'company', 'admin']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  profileImageUrl: {
    type: String,
    default: null
  },
  otp: {
    type: String,
    default: null
  },
  otpExpiry: {
    type: Date,
    default: null
  },
  otpAttempts: {
    type: Number,
    default: 0
  },
  otpVerifiedForReset: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

// email: unique index is already created by the `unique: true` field option above.
// DO NOT add a duplicate userSchema.index({ email: 1 }) here — it would create
// two indexes on the same field and trigger a Mongoose warning.

// Compound index: admin dashboard filters active users by role
// Query: User.find({ role: 'student', isActive: true })
// Supports: role-only queries too (leftmost prefix rule)
userSchema.index({ role: 1, isActive: 1 });

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

// Hash password before saving — skip if already hashed (skipHash flag set by verifyOTP)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.$locals.skipHash) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ---------------------------------------------------------------------------
// Instance methods
// ---------------------------------------------------------------------------

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
