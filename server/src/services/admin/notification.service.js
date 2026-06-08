import prisma from '../../utils/prisma.js';
import { logAdminAction } from '../../middleware/auditLog.js';
import {
  sendNotificationToAll,
  sendNotificationToAssociate,
} from '../notification.service.js';

// ─── adminSendNotification ────────────────────────────────────────────────────

/**
 * Send a notification to all users, specific associates, or associates by package.
 * @param {string} title
 * @param {string} message
 * @param {'all'|'specific'|'package'} target
 * @param {string[]|null} targetIds - associate IDs (specific) or packageId (package)
 * @param {string} adminId
 * @returns {Promise<object>} Result summary
 */
export async function adminSendNotification(title, message, target, targetIds, adminId) {
  let result;

  if (target === 'all') {
    // Send via FCM topic AND create DB records for all active associates
    await sendNotificationToAll(title, message, 'ANNOUNCEMENT', {});
    
    // Also create DB notification records so associates can see them in history
    const allAssociates = await prisma.associate.findMany({
      where: { deletedAt: null, status: 'ACTIVE' },
      select: { id: true },
    });
    
    if (allAssociates.length > 0) {
      await prisma.notification.createMany({
        data: allAssociates.map((a) => ({
          associateId: a.id,
          title,
          message,
          type: 'ANNOUNCEMENT',
          isRead: false,
        })),
      });
    }
    
    result = { succeeded: allAssociates.length, failed: 0, total: allAssociates.length };
  } else if (target === 'specific') {
    if (!targetIds || targetIds.length === 0) {
      throw Object.assign(new Error('targetIds is required for specific target'), { statusCode: 400 });
    }

    // Resolve targetIds (which can be UUIDs or userIds like IW100001) to active associates
    const associates = await prisma.associate.findMany({
      where: {
        OR: [
          { id: { in: targetIds } },
          { userId: { in: targetIds } },
        ],
        deletedAt: null,
      },
      select: { id: true, userId: true },
    });

    if (associates.length === 0) {
      throw Object.assign(new Error('No valid associates found for the provided IDs'), { statusCode: 400 });
    }

    const results = await Promise.allSettled(
      associates.map((a) =>
        sendNotificationToAssociate(a.id, title, message, 'ANNOUNCEMENT', {}),
      ),
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;
    result = {
      succeeded,
      failed,
      total: targetIds.length,
      recipients: associates.map((a) => a.userId),
    };
  } else if (target === 'package') {
    if (!targetIds || targetIds.length === 0) {
      throw Object.assign(new Error('targetIds (packageId) is required for package target'), { statusCode: 400 });
    }

    const packageInput = targetIds[0];
    const pkg = await prisma.package.findFirst({
      where: {
        OR: [
          { id: packageInput },
          { name: { equals: packageInput, mode: 'insensitive' } },
        ],
      },
      select: { id: true, name: true },
    });

    if (!pkg) {
      throw Object.assign(new Error(`Package not found: ${packageInput}`), { statusCode: 400 });
    }

    const associates = await prisma.associate.findMany({
      where: { packageId: pkg.id, deletedAt: null },
      select: { id: true, userId: true },
    });

    if (associates.length === 0) {
      result = { succeeded: 0, failed: 0, total: 0, packageName: pkg.name };
    } else {
      const results = await Promise.allSettled(
        associates.map((a) =>
          sendNotificationToAssociate(a.id, title, message, 'ANNOUNCEMENT', { packageId: pkg.id }),
        ),
      );

      const succeeded = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;
      result = {
        succeeded,
        failed,
        total: associates.length,
        packageName: pkg.name,
      };
    }
  } else {
    throw Object.assign(new Error('Invalid target. Must be one of: all, specific, package'), { statusCode: 400 });
  }

  // Log the notification action in AdminAuditLog
  await logAdminAction(adminId, 'SEND_NOTIFICATION', 'Notification', null, {
    title,
    message,
    target,
    targetIds: targetIds ?? [],
    result,
  });

  return result;
}

// ─── adminGetNotificationHistory ──────────────────────────────────────────────

/**
 * Return paginated AdminAuditLog records where action = 'SEND_NOTIFICATION'.
 * @param {{ page, pageSize, skip, take }} pagination
 */
export async function adminGetNotificationHistory(pagination) {
  const { page, pageSize, skip, take } = pagination;

  const where = { action: 'SEND_NOTIFICATION' };

  const [records, totalItems] = await Promise.all([
    prisma.adminAuditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      select: {
        id: true,
        adminId: true,
        action: true,
        details: true,
        createdAt: true,
        admin: { select: { name: true, email: true } },
      },
    }),
    prisma.adminAuditLog.count({ where }),
  ]);

  const items = records.map((r) => {
    const details = (r.details && typeof r.details === 'object') ? r.details : {};
    return {
      id: r.id,
      adminId: r.adminId,
      adminName: r.admin?.name || 'Admin',
      adminEmail: r.admin?.email || '',
      title: details.title || '',
      message: details.message || '',
      target: details.target || 'all',
      targetDetails: details.target === 'specific'
        ? (details.result?.recipients?.join(', ') || details.targetIds?.join(', ') || '')
        : details.target === 'package'
        ? (details.result?.packageName || details.targetIds?.[0] || '')
        : 'all',
      details: r.details,
      createdAt: r.createdAt,
    };
  });

  return { items, totalItems, page, pageSize };
}
