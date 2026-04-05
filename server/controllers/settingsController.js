const SystemSettings = require('../models/SystemSettings');
const { success, error } = require('../utils/apiResponse');

// @desc    Get current placement settings
// @route   GET /api/admin/settings
// @access  Private (admin)
exports.getSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.getSettings();
    return success(res, settings, 'Settings fetched');
  } catch (err) {
    console.error('Get settings error:', err);
    return error(res, 'Failed to fetch settings', 500);
  }
};

// @desc    Update placement settings
// @route   PUT /api/admin/settings
// @access  Private (admin)
exports.updateSettings = async (req, res) => {
  try {
    const allowedFields = [
      'allowMultipleOffers',
      'maxApplicationsPerStudent',
      'blockPlacedFromApplying',
      'minCGPAOverride',
      'placementSeasonActive'
    ];

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings();
    }

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    }

    settings.lastUpdatedBy = req.user._id;
    await settings.save();

    // Re-fetch with populated lastUpdatedBy
    const populated = await SystemSettings.findById(settings._id)
      .populate('lastUpdatedBy', 'name email');

    return success(res, populated, 'Settings updated successfully');
  } catch (err) {
    console.error('Update settings error:', err);
    return error(res, 'Failed to update settings', 500);
  }
};
