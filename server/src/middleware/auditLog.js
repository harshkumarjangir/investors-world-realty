import prisma from '../utils/prisma.js';

/**
 * Creates an admin audit log entry.
 * Call this inside route handlers after the action succeeds.
 */
export async function logAdminAction(adminId, action, entity, entityId = null, details = null, ipAddress = null) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminId,
        action,
        entity,
        entityId: entityId ? String(entityId) : null,
        details,
        ipAddress,
      },
    });
  } catch (err) {
    // Audit log failure should never block the main operation
    console.error('[AUDIT] Failed to log admin action:', err.message);
  }
}
