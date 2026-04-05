const Notification = require('../models/Notification');
const { emitToUser } = require('./socketService');

/**
 * Create a notification in DB and emit it in real-time via Socket.IO.
 * @param {object} params
 * @param {string} params.userId - The User._id to notify
 * @param {string} params.title
 * @param {string} params.message
 * @param {string} [params.type='general']
 * @param {string} [params.link='']
 * @returns {Promise<object>} The created notification document
 */
const createAndEmitNotification = async ({ userId, title, message, type = 'general', link = '' }) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      link
    });

    // Real-time push
    emitToUser(String(userId), 'notification', {
      _id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      link: notification.link,
      isRead: false,
      createdAt: notification.createdAt
    });

    return notification;
  } catch (err) {
    console.error('[NotificationHelper] Failed to create notification:', err.message);
    return null;
  }
};

/**
 * Create multiple notifications in bulk and emit each in real-time.
 * @param {Array<{user: string, title: string, message: string, type?: string, link?: string}>} notifications
 * @returns {Promise<Array>} The created notification documents
 */
const createAndEmitBulkNotifications = async (notifications) => {
  if (!notifications || notifications.length === 0) return [];

  try {
    const docs = await Notification.insertMany(notifications);

    // Emit to each unique user
    for (const doc of docs) {
      emitToUser(String(doc.user), 'notification', {
        _id: doc._id,
        title: doc.title,
        message: doc.message,
        type: doc.type,
        link: doc.link,
        isRead: false,
        createdAt: doc.createdAt
      });
    }

    return docs;
  } catch (err) {
    console.error('[NotificationHelper] Bulk notification error:', err.message);
    return [];
  }
};

module.exports = { createAndEmitNotification, createAndEmitBulkNotifications };
