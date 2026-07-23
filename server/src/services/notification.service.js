import prisma from '../utils/prisma.js';
import {
  subscribeToTopic,
  unsubscribeFromTopic,
  sendToDevices,
  sendToTopic,
  TOPICS,
} from '../utils/firebase.js';

// ─── registerDeviceToken ──────────────────────────────────────────────────────

/**
 * Upsert a device token for an associate.
 * If the token already exists for a different associate, reassign it.
 * Subscribes the token to the `all_users` FCM topic.
 *
 * @param {string} associateId
 * @param {string} token - FCM device token
 * @param {string} platform - android | ios | web
 * @returns {Promise<object>} Upserted DeviceToken record
 */
export async function registerDeviceToken(associateId, token, platform) {
  const record = await prisma.deviceToken.upsert({
    where: { token },
    update: { associateId, platform },
    create: { associateId, token, platform },
  });

  // Subscribe to all_users topic (fire-and-forget)
  (async () => {
    try {
      await subscribeToTopic([token], TOPICS.ALL_USERS);
    } catch (err) {
      console.error('[NOTIFICATION] Topic subscribe failed:', err.message);
    }
  })();

  return record;
}

// ─── removeDeviceToken ────────────────────────────────────────────────────────

/**
 * Delete a device token belonging to the given associate.
 * Unsubscribes the token from the `all_users` FCM topic.
 *
 * @param {string} associateId
 * @param {string} token
 * @returns {Promise<{ success: boolean }>}
 */
export async function removeDeviceToken(associateId, token) {
  const existing = await prisma.deviceToken.findFirst({
    where: { token, associateId },
  });

  if (!existing) {
    throw Object.assign(new Error('Device token not found'), { statusCode: 404 });
  }

  await prisma.deviceToken.delete({ where: { token } });

  // Unsubscribe from all_users topic (fire-and-forget)
  (async () => {
    try {
      await unsubscribeFromTopic([token], TOPICS.ALL_USERS);
    } catch (err) {
      console.error('[NOTIFICATION] Topic unsubscribe failed:', err.message);
    }
  })();

  return { success: true };
}

// ─── getNotifications ─────────────────────────────────────────────────────────

/**
 * Return paginated notifications for an associate, newest first.
 *
 * @param {string} associateId
 * @param {{ page, pageSize, skip, take }} pagination
 * @returns {Promise<{ items, totalItems, page, pageSize }>}
 */
export async function getNotifications(associateId, pagination = {}) {
  const { page = 1, pageSize = 20, skip = 0, take = 20 } = pagination;

  const [records, totalItems] = await Promise.all([
    prisma.notification.findMany({
      where: { associateId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        isRead: true,
        data: true,
        createdAt: true,
      },
    }),
    prisma.notification.count({ where: { associateId, isDeleted: false } }),
  ]);

  const items = records.map((r) => ({
    id: r.id,
    title: r.title,
    message: r.message,
    type: r.type,
    isRead: r.isRead,
    data: r.data,
    createdAt: r.createdAt,
  }));

  return { items, totalItems, page, pageSize };
}

// ─── markAsRead ───────────────────────────────────────────────────────────────

/**
 * Mark a single notification as read.
 * Throws 404 if the notification does not belong to the associate.
 *
 * @param {string} associateId
 * @param {string} notificationId
 * @returns {Promise<object>} Updated Notification record
 */
export async function markAsRead(associateId, notificationId) {
  const existing = await prisma.notification.findFirst({
    where: { id: notificationId, associateId, isDeleted: false },
  });

  if (!existing) {
    throw Object.assign(new Error('Notification not found'), { statusCode: 404 });
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
    select: {
      id: true,
      title: true,
      message: true,
      type: true,
      isRead: true,
      data: true,
      createdAt: true,
    },
  });

  return updated;
}

// ─── deleteNotification ────────────────────────────────────────────────────────

/**
 * Soft delete a notification (sets isDeleted to true) so it won't show to the user,
 * but remains in the database.
 * Throws 404 if the notification does not belong to the associate.
 *
 * @param {string} associateId
 * @param {string} notificationId
 * @returns {Promise<{ success: boolean }>}
 */
export async function deleteNotification(associateId, notificationId) {
  const existing = await prisma.notification.findFirst({
    where: { id: notificationId, associateId, isDeleted: false },
  });

  if (!existing) {
    throw Object.assign(new Error('Notification not found'), { statusCode: 404 });
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { isDeleted: true },
  });

  return { success: true };
}

// ─── sendNotificationToAssociate ──────────────────────────────────────────────

/**
 * Create a Notification DB record and push to all associate devices.
 * Push failures never block the response (fire-and-forget).
 *
 * @param {string} associateId
 * @param {string} title
 * @param {string} message
 * @param {string} type - NotificationType enum value
 * @param {object} [data={}] - Additional payload stored in the record
 * @returns {Promise<object>} Created Notification record
 */
export async function sendNotificationToAssociate(associateId, title, message, type, data = {}) {
  const notification = await prisma.notification.create({
    data: {
      associateId,
      title,
      message,
      type,
      data,
    },
    select: {
      id: true,
      title: true,
      message: true,
      type: true,
      isRead: true,
      data: true,
      createdAt: true,
    },
  });

  // Fire-and-forget push to all associate devices
  (async () => {
    try {
      const deviceTokens = await prisma.deviceToken.findMany({
        where: { associateId },
        select: { token: true },
      });

      const tokens = deviceTokens.map((d) => d.token);
      if (tokens.length > 0) {
        await sendToDevices(
          tokens,
          { title, body: message },
          { type, notificationId: notification.id, ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])) },
        );
      }
    } catch (err) {
      console.error('[NOTIFICATION] Push to associate failed:', err.message);
    }
  })();

  return notification;
}

// ─── sendNotificationToAll ────────────────────────────────────────────────────

/**
 * Broadcast a push notification to all users via the `all_users` FCM topic.
 * No individual DB records are created to avoid row explosion.
 *
 * @param {string} title
 * @param {string} message
 * @param {string} type - NotificationType enum value
 * @param {object} [data={}]
 * @returns {Promise<{ success: boolean }>}
 */
export async function sendNotificationToAll(title, message, type, data = {}) {
  try {
    const allTokens = await prisma.deviceToken.findMany({
      select: { token: true },
    });
    const tokens = allTokens.map((d) => d.token);
    
    if (tokens.length > 0) {
      await sendToDevices(
        tokens,
        { title, body: message },
        { type, ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])) }
      );
    }
  } catch (err) {
    console.error('[NOTIFICATION] Broadcast to all devices failed:', err.message);
  }

  return { success: true };
}
