import {
  adminSendNotification,
  adminGetNotificationHistory,
} from '../../services/admin/notification.service.js';
import { successResponse, paginatedResponse, parsePagination } from '../../utils/response.js';

export async function sendNotificationHandler(req, res, next) {
  try {
    const { title, message, target, targetIds } = req.body;
    const adminId = req.admin.id;

    if (!title || !message || !target) {
      return res.status(400).json({ status: 'error', message: 'title, message, and target are required', data: null });
    }

    const result = await adminSendNotification(title, message, target, targetIds ?? null, adminId);
    return successResponse(res, result, 'Notification sent successfully');
  } catch (err) {
    return next(err);
  }
}

export async function getNotificationHistoryHandler(req, res, next) {
  try {
    const pagination = parsePagination(req.query);
    const result = await adminGetNotificationHistory(pagination);
    return paginatedResponse(res, result.items, result.totalItems, result.page, result.pageSize, 'Notification history');
  } catch (err) {
    return next(err);
  }
}
