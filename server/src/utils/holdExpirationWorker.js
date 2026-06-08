import prisma from './prisma.js';
import { sendToDevices } from './firebase.js';

export function startHoldExpirationWorker(intervalMs = 60000) {
  console.log('[WORKER] Hold expiration worker started');

  setInterval(async () => {
    try {
      const now = new Date();
      // Find properties on hold that have expired
      const expiredProperties = await prisma.property.findMany({
        where: {
          status: 'HOLD',
          holdExpiresAt: { lte: now },
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          heldByAssociateId: true,
        },
      });

      if (expiredProperties.length === 0) return;

      console.log(`[WORKER] Found ${expiredProperties.length} expired holds`);

      for (const property of expiredProperties) {
        await prisma.$transaction(async (tx) => {
          // Revert property status
          await tx.property.update({
            where: { id: property.id },
            data: {
              status: 'AVAILABLE',
              holdExpiresAt: null,
              heldByAssociateId: null,
            },
          });

          // Update active hold booking to EXPIRED
          const activeHoldBooking = await tx.booking.findFirst({
            where: {
              propertyId: property.id,
              status: 'HOLD',
            },
            orderBy: { createdAt: 'desc' },
          });

          if (activeHoldBooking) {
            await tx.booking.update({
              where: { id: activeHoldBooking.id },
              data: { status: 'EXPIRED' },
            });
          }

          // Send push notification to the associate who held it
          if (property.heldByAssociateId) {
            const tokens = await tx.deviceToken.findMany({
              where: { associateId: property.heldByAssociateId },
              select: { token: true },
            });
            const tokenList = tokens.map((t) => t.token);
            if (tokenList.length > 0) {
              await sendToDevices(tokenList, {
                title: 'Hold Expired',
                body: `Your hold on property "${property.name}" has expired and is now available to others.`,
              }, { type: 'HOLD_EXPIRED', propertyId: property.id });
            }
          }
        });
      }
    } catch (err) {
      console.error('[WORKER] Error in hold expiration worker:', err);
    }
  }, intervalMs);
}
