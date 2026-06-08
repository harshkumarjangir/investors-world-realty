import {
  registerDeviceToken,
  removeDeviceToken,
  getNotifications,
  markAsRead,
  deleteNotification,
} from '../services/notification.service.js';
import {
  successResponse,
  createdResponse,
  errorResponse,
  paginatedResponse,
  parsePagination,
} from '../utils/response.js';

// ─── POST /device-token ───────────────────────────────────────────────────────
export async function registerDeviceTokenHandler(req, res) {
  try {
    const associateId = req.associate.id;
    const { token, platform } = req.body;

    if (!token) {
      return errorResponse(res, 'token is required', 400);
    }
    if (!platform) {
      return errorResponse(res, 'platform is required', 400);
    }

    const validPlatforms = ['android', 'ios', 'web'];
    if (!validPlatforms.includes(platform)) {
      return errorResponse(res, `platform must be one of: ${validPlatforms.join(', ')}`, 400);
    }

    const record = await registerDeviceToken(associateId, token, platform);
    return createdResponse(res, record, 'Device token registered successfully');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}

// ─── DELETE /device-token ─────────────────────────────────────────────────────
export async function removeDeviceTokenHandler(req, res) {
  try {
    const associateId = req.associate.id;
    const { token } = req.body;

    if (!token) {
      return errorResponse(res, 'token is required', 400);
    }

    const result = await removeDeviceToken(associateId, token);
    return successResponse(res, result, 'Device token removed successfully');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}

// ─── GET / ────────────────────────────────────────────────────────────────────
export async function getNotificationsHandler(req, res) {
  try {
    const associateId = req.associate.id;
    const pagination = parsePagination(req.query);

    const { items, totalItems, page, pageSize } = await getNotifications(associateId, pagination);
    return paginatedResponse(res, items, totalItems, page, pageSize, 'Notifications fetched successfully');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}

// ─── PATCH /:id/read ──────────────────────────────────────────────────────────
export async function markAsReadHandler(req, res) {
  try {
    const associateId = req.associate.id;
    const notificationId = req.params.id;

    const updated = await markAsRead(associateId, notificationId);
    return successResponse(res, updated, 'Notification marked as read');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}

// ─── DELETE /:id ──────────────────────────────────────────────────────────────
export async function deleteNotificationHandler(req, res) {
  try {
    const associateId = req.associate.id;
    const notificationId = req.params.id;

    const result = await deleteNotification(associateId, notificationId);
    return successResponse(res, result, 'Notification deleted successfully');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}
