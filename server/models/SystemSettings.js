const mongoose = require('mongoose');

const DEFAULT_LOGO_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png';

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

  // ── Branding & Contact fields (Tasks 2 & 4) ──

  // Platform/institution logo URL (web URL only, no local paths)
  logoUrl: {
    type: String,
    default: DEFAULT_LOGO_URL,
    validate: {
      validator: function (v) {
        if (!v) return true; // allow empty
        try {
          const url = new URL(v);
          return ['http:', 'https:'].includes(url.protocol);
        } catch {
          return false;
        }
      },
      message: 'Logo URL must be a valid http or https URL'
    }
  },

  // Company/institution name displayed on contact page and emails
  companyName: {
    type: String,
    default: 'Placement Management System',
    trim: true
  },

  // Admin contact email — displayed on Contact Us page, receives contact form submissions
  contactEmail: {
    type: String,
    default: 'admin@pms.com',
    lowercase: true,
    trim: true
  },

  // Contact phone number
  phone: {
    type: String,
    default: '',
    trim: true
  },

  // Contact physical address
  address: {
    type: String,
    default: '',
    trim: true
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
module.exports.DEFAULT_LOGO_URL = DEFAULT_LOGO_URL;
