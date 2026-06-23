import prisma from '../utils/prisma.js';

/**
 * Promotion System
 * 
 * Rank 1: Business Associate → Sell 500 gaj personally → Promoted to Rank 2
 * Rank 2: Business Adviser → 3 direct downlines each sell 500 gaj → Promoted to Rank 3
 * Rank 3-9: Same pattern (3 downlines achieve previous rank criteria)
 * Rank 10: President Club → Top level, can add anyone directly
 * 
 * Promotion criteria:
 * - First promotion (Rank 1→2): Personal sale of 500 gaj total
 * - Subsequent promotions: 3 direct downlines each achieve 500 gaj
 */

const RANK_NAMES = [
  '',                        // 0 (unused)
  'Business Associate',      // 1
  'Business Adviser',        // 2
  'Business Head',           // 3
  'Dist. Business Head',     // 4
  'State Business Head',     // 5
  'Regional Business Head',  // 6
  'National Business Head',  // 7
  'Vice President Sales',    // 8
  'President Sales',         // 9
  'President Club',          // 10
];

const PROMOTION_THRESHOLD_GAJ = 500;
const MAX_DIRECT_DOWNLINES = 3;

export function getRankName(rank) {
  return RANK_NAMES[rank] || 'Unknown';
}

/**
 * Check and process promotion for an associate after a property sale.
 * Called after totalAreaSold is updated.
 * 
 * @param {string} associateId
 * @returns {object|null} Promotion result or null if no promotion
 */
export async function checkAndPromote(associateId) {
  const associate = await prisma.associate.findUnique({
    where: { id: associateId },
    select: { id: true, rank: true, totalAreaSold: true, userId: true },
  });

  if (!associate) return null;
  if (associate.rank >= 10) return null; // Already President Club

  // First promotion: Rank 1 → 2 (personal 500 gaj)
  if (associate.rank === 1) {
    if (associate.totalAreaSold >= PROMOTION_THRESHOLD_GAJ) {
      await prisma.associate.update({
        where: { id: associateId },
        data: { rank: 2 },
      });
      console.log(`[PROMOTION] ${associate.userId} promoted to Business Adviser (sold ${associate.totalAreaSold} gaj)`);
      
      // Recursively check if they now immediately qualify for Rank 3 (e.g. they sold 2000+ gaj directly)
      const furtherPromotion = await checkAndPromote(associateId);
      if (furtherPromotion) {
        return furtherPromotion;
      }
      
      return { associateId, oldRank: 1, newRank: 2, rankName: 'Business Adviser' };
    }
    return null;
  }

  // Subsequent promotions: Rank 2+
  let qualifiesForNextRank = false;
  let promotionReason = '';

  const directDownlines = await prisma.associate.findMany({
    where: {
      sponsorId: associateId,
      deletedAt: null,
      totalAreaSold: { gte: PROMOTION_THRESHOLD_GAJ },
    },
    select: { id: true, totalAreaSold: true },
  });

  if (directDownlines.length >= MAX_DIRECT_DOWNLINES) {
    qualifiesForNextRank = true;
    promotionReason = '3 downlines qualified';
  } else if (associate.rank === 2 && associate.totalAreaSold >= 2000) {
    qualifiesForNextRank = true;
    promotionReason = `personal sales of ${associate.totalAreaSold} gaj`;
  }

  if (qualifiesForNextRank) {
    const newRank = Math.min(associate.rank + 1, 10);
    if (newRank > associate.rank) {
      await prisma.associate.update({
        where: { id: associateId },
        data: { rank: newRank },
      });

      // Also promote the qualifying downlines to rank 2 (Business Adviser) if they're still rank 1
      if (directDownlines.length >= MAX_DIRECT_DOWNLINES) {
        for (const dl of directDownlines.slice(0, 3)) {
          await prisma.associate.updateMany({
            where: { id: dl.id, rank: 1 },
            data: { rank: 2 },
          });
        }
      }

      console.log(`[PROMOTION] ${associate.userId} promoted to ${getRankName(newRank)} (${promotionReason})`);
      
      // If promoted to Rank 2, and they already qualify for Rank 3, check again!
      const furtherPromotion = await checkAndPromote(associateId);
      if (furtherPromotion) {
        return furtherPromotion;
      }
      
      return { associateId, oldRank: associate.rank, newRank, rankName: getRankName(newRank) };
    }
  }

  return null;
}

/**
 * Update totalAreaSold for an associate after a property sale and check promotion.
 * 
 * @param {string} associateId - The seller
 * @param {number} areaGaj - Area sold in gaj
 * @returns {object} { updated, promotion }
 */
export async function recordSaleAndCheckPromotion(associateId, areaGaj) {
  // Update total area sold
  const updated = await prisma.associate.update({
    where: { id: associateId },
    data: { totalAreaSold: { increment: areaGaj } },
  });

  // Check promotion for seller
  const sellerPromotion = await checkAndPromote(associateId);

  // Also check promotion for seller's sponsor (their downline just sold more)
  let sponsorPromotion = null;
  if (updated.sponsorId) {
    sponsorPromotion = await checkAndPromote(updated.sponsorId);
  }

  return { updated, sellerPromotion, sponsorPromotion };
}

/**
 * Check if an associate can add more downlines.
 * - Rank 1 (Business Associate): Cannot add anyone (must get promoted first)
 * - Rank 2-9: Can add up to 3 direct Business Associates
 * - Rank 10 (President Club): Can add unlimited
 * 
 * @param {string} associateId
 * @returns {object} { canAdd, currentCount, maxAllowed, reason }
 */
export async function canAddDownline(associateId) {
  const associate = await prisma.associate.findUnique({
    where: { id: associateId },
    select: { rank: true },
  });

  if (!associate) return { canAdd: false, reason: 'Associate not found' };

  if (associate.rank === 1) {
    return { canAdd: false, currentCount: 0, maxAllowed: 0, reason: 'Must be promoted to Business Adviser first (sell 500 gaj)' };
  }

  if (associate.rank >= 10) {
    return { canAdd: true, currentCount: 0, maxAllowed: Infinity, reason: 'President Club - unlimited' };
  }

  // Count current direct downlines
  const currentCount = await prisma.associate.count({
    where: { sponsorId: associateId, deletedAt: null },
  });

  const maxAllowed = MAX_DIRECT_DOWNLINES;
  const canAdd = currentCount < maxAllowed;

  return {
    canAdd,
    currentCount,
    maxAllowed,
    reason: canAdd ? 'OK' : `Already has ${maxAllowed} direct downlines`,
  };
}
