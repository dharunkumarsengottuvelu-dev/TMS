import * as notificationService from '../services/notificationService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export async function getUserNotifications(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const result = await notificationService.getUserNotifications(req.user.id, { page, limit });
    return sendSuccess(res, result.notifications, 'Notifications retrieved', 200, {
      ...result.pagination,
      unreadCount: result.unreadCount,
    });
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const notification = await notificationService.markNotificationAsRead(
      req.params.id,
      req.user.id
    );
    return sendSuccess(res, notification, 'Notification marked as read', 200);
  } catch (error) {
    next(error);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    await notificationService.markAllNotificationsAsRead(req.user.id);
    return sendSuccess(res, null, 'All notifications marked as read', 200);
  } catch (error) {
    next(error);
  }
}
