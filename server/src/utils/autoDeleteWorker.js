import prisma from './prisma.js';
import { adminDeleteAssociate } from '../services/admin/associate.service.js';

export function startAutoDeleteWorker() {
  // Run once immediately, then every 24 hours
  checkAndDelete();
  setInterval(checkAndDelete, 24 * 60 * 60 * 1000);
}

async function checkAndDelete() {
  try {
    // console.log('[AUTO-DELETE] Checking for scheduled account deletions...');
    
    // Find all associates where scheduledDeletionAt is in the past
    const toDelete = await prisma.associate.findMany({
      where: {
        deletedAt: null,
        scheduledDeletionAt: {
          lte: new Date(),
        },
      },
      select: { id: true, userId: true },
    });

    for (const associate of toDelete) {
      try {
        console.log(`[AUTO-DELETE] Processing deletion for associate ${associate.userId}`);
        // 'SYSTEM' represents the automated background job
        await adminDeleteAssociate(associate.id, 'SYSTEM');
        console.log(`[AUTO-DELETE] Successfully deleted associate ${associate.userId}`);
      } catch (err) {
        console.error(`[AUTO-DELETE] Failed to auto-delete associate ${associate.userId}:`, err.message);
        // We do not throw here, so it continues attempting to delete others
      }
    }
  } catch (err) {
    console.error('[AUTO-DELETE WORKER ERROR]', err);
  }
}
