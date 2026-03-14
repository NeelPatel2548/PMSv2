const Notification = require('../models/Notification');
const { success, error } = require('../utils/apiResponse');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;

    const filter = { user: req.user._id };
    if (unreadOnly === 'true') filter.isRead = false;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

    return success(res, {
      notifications,
      total,
      unreadCount,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    }, 'Notifications fetched');
  } catch (err) {
    console.error('Get notifications error:', err);
    return error(res, 'Failed to fetch notifications', 500);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { returnDocument: 'after' }
    );

    if (!notification) {
      return error(res, 'Notification not found', 404);
    }

    return success(res, notification, 'Notification marked as read');
  } catch (err) {
    console.error('Mark as read error:', err);
    return error(res, 'Failed to update notification', 500);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    return success(res, null, 'All notifications marked as read');
  } catch (err) {
    console.error('Mark all read error:', err);
    return error(res, 'Failed to update notifications', 500);
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notification) {
      return error(res, 'Notification not found', 404);
    }

    return success(res, null, 'Notification deleted');
  } catch (err) {
    console.error('Delete notification error:', err);
    return error(res, 'Failed to delete notification', 500);
  }
};

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      isRead: false
    });

    return success(res, { count }, 'Unread count fetched');
  } catch (err) {
    console.error('Unread count error:', err);
    return error(res, 'Failed to fetch count', 500);
  }
};
