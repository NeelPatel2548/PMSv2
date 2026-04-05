const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Notification title is required']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required']
  },
  type: {
    type: String,
    required: true,
    enum: ['job_posted', 'application_update', 'interview_scheduled',
           'offer_received', 'announcement', 'security']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  link: {
    type: String,
    default: null
  }
}, { timestamps: true });

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

// Compound: unread count badge — the most frequent notification query
// Query: Notification.countDocuments({ user: userId, isRead: false })
// user first (equality, high selectivity), isRead second (boolean filter)
notificationSchema.index({ user: 1, isRead: 1 });

// Compound: notification feed sorted by date for a user
// Query: Notification.find({ user: userId }).sort({ createdAt: -1 })
// Keeps this separate from the isRead index so each query hits the right index.
notificationSchema.index({ user: 1, createdAt: -1 });

// TTL index: auto-delete notifications older than 90 days (7,776,000 seconds).
// MongoDB's TTL background thread runs every 60 seconds and deletes documents
// where createdAt < now - expireAfterSeconds. No application code needed.
// NOTE: TTL indexes cannot be compound indexes — must be a single-field index.
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('Notification', notificationSchema);
