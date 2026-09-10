import { Notification } from '../models/Notification.js';

export async function createNotification({ recipient, sender = null, type, title, message, relatedTask = null }) {
  try {
    return await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      relatedTask,
    });
  } catch (error) {
    console.error('⚠️ [NotificationService] Failed to create notification:', error.message);
    return null;
  }
}

export async function getUserNotifications(userId, { page = 1, limit = 15 }) {
  const skip = (page - 1) * limit;
  const [notifications, unreadCount, total] = await Promise.all([
    Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name email role')
      .populate('relatedTask', 'title priority status')
      .lean(),
    Notification.countDocuments({ recipient: userId, isRead: false }),
    Notification.countDocuments({ recipient: userId }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function markNotificationAsRead(notificationId, userId) {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { new: true }
  );
  return notification;
}

export async function markAllNotificationsAsRead(userId) {
  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );
  return { success: true };
}
