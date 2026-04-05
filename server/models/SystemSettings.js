const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  // Can students hold multiple accepted offers simultaneously?
  allowMultipleOffers: {
    type: Boolean,
    default: false
  },

  // Maximum number of active applications per student (0 = unlimited)
  maxApplicationsPerStudent: {
    type: Number,
    default: 0,
    min: 0
  },

  // Should placed students be blocked from applying to new jobs?
  blockPlacedFromApplying: {
    type: Boolean,
    default: true
  },

  // Global minimum CGPA floor (overrides individual job settings if higher)
  minCGPAOverride: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },

  // Master switch — is the placement season currently active?
  placementSeasonActive: {
    type: Boolean,
    default: true
  },

  // Who last updated these settings
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

/**
 * Get the singleton settings document, creating it with defaults if it doesn't exist.
 */
systemSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne().populate('lastUpdatedBy', 'name email');
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
