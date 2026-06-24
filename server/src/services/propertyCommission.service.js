import prisma from '../utils/prisma.js';

const RANK_NAMES = [
  '', 'Business Associate', 'Business Adviser', 'Business Head',
  'Dist. Business Head', 'State Business Head', 'Regional Business Head',
  'National Business Head', 'Vice President Sales', 'President Sales', 'President Club',
];


/**
 * Property Sale Commission Engine — GAP Commission Model
 * 
 * When a property is sold/booked:
 * 1. Find the commission slab based on property area (gaj)
 * 2. Give seller their direct commission % (e.g., 4%)
 * 3. Walk UP the tree (up to 9 levels) and give each ancestor the GAP %
 *    GAP = (their level slab %) - (previous level slab %)
 *    Example: Level 1 (6%) - Level 0 (4%) = 2% gap commission
 * 4. Downline gets nothing — only upline earns
 * 5. Total distributed = highest level % (e.g., 16% for President Club)
 */

// ─── Get Commission Slab ──────────────────────────────────────────────────────

/**
 * Find the active commission slab for a given property area.
 * @param {number} areaInGaj - Property area in gaj/sq yards
 * @returns {object|null} Commission slab or null
 */
export async function getCommissionSlab(areaInGaj) {
  const slab = await prisma.propertyCommissionSlab.findFirst({
    where: {
      isActive: true,
      minArea: { lte: areaInGaj },
      maxArea: { gte: areaInGaj },
    },
  });
  return slab;
}

// ─── Calculate Property Sale Commission ───────────────────────────────────────

/**
 * Calculate and record commissions for a property sale.
 * Called when a booking is confirmed/property is sold.
 * 
 * @param {string} sellerAssociateId - The associate who sold the property
 * @param {string} propertyId - The property being sold
 * @param {string} bookingId - The booking record
 * @param {number} propertyPrice - Sale price of the property
 * @param {number} propertyAreaGaj - Area of the property in gaj
 * @returns {object} { sellerCommission, uplineCommissions: [...], totalDistributed }
 */
export async function calculatePropertySaleCommission(
  sellerAssociateId,
  propertyId,
  bookingId,
  propertyPrice,
  propertyAreaGaj,
) {
  // 1. Find the commission slab
  const slab = await getCommissionSlab(propertyAreaGaj);
  if (!slab) {
    console.warn(`[COMMISSION] No slab found for area ${propertyAreaGaj} gaj`);
    return { sellerCommission: null, uplineCommissions: [], totalDistributed: 0 };
  }

  const commissions = [];
  let totalDistributed = 0;

  // All slab percentages by rank (index 0 = rank 1 Business Associate, index 8 = rank 9 President Sales)
  const rankSlabPercents = [
    Number(slab.sellerPercent),   // Rank 1: Business Associate
    Number(slab.level1Percent),   // Rank 2: Business Adviser
    Number(slab.level2Percent),   // Rank 3: Business Head
    Number(slab.level3Percent),   // Rank 4: Dist. Business Head
    Number(slab.level4Percent),   // Rank 5: State Business Head
    Number(slab.level5Percent),   // Rank 6: Regional Business Head
    Number(slab.level6Percent),   // Rank 7: National Business Head
    Number(slab.level7Percent),   // Rank 8: Vice President Sales
    Number(slab.level8Percent),   // Rank 9: President Sales
  ];
  const presidentClubFlat = Number(slab.level9Percent) || 2; // Rank 10: President Club (flat %)

  // 2. Get seller's rank to determine their commission %
  const sellerAssociate = await prisma.associate.findUnique({
    where: { id: sellerAssociateId },
    select: { rank: true },
  });
  const sellerRank = sellerAssociate?.rank || 1;

  // Seller gets their rank's full slab %
  // If President Club (rank 10) sells, they get rank 9's % + flat 2% = full pool
  let sellerPercent;
  if (sellerRank >= 10) {
    sellerPercent = rankSlabPercents[8] + presidentClubFlat; // President Sales % + flat 2%
  } else {
    sellerPercent = rankSlabPercents[sellerRank - 1] || rankSlabPercents[0];
  }
  
  // 2% TDS deduction on property price before commission calculation
  const tdsDeduction = propertyPrice * 0.02;
  const commissionablePrice = propertyPrice - tdsDeduction;

  const sellerAmount = (commissionablePrice * sellerPercent) / 100;

  const sellerRecord = await prisma.propertySaleCommission.create({
    data: {
      propertyId,
      bookingId,
      associateId: sellerAssociateId,
      sellerAssociateId,
      level: 0,
      percentage: sellerPercent,
      propertyPrice,
      propertyArea: propertyAreaGaj,
      commissionAmount: sellerAmount / 100, // Stored in IWR Coins
      status: 'PENDING',
    },
  });
  commissions.push(sellerRecord);
  totalDistributed += sellerAmount;

  // 3. Walk UP the tree — give GAP commission to each ancestor
  // GAP method: each upline gets (their rank's slab % - previous rank's slab %)
  // Level percentages represent CUMULATIVE slabs, gap is the difference
  const slabPercentages = rankSlabPercents; // [4%, 6%, 7.5%, 9%, 10%, 11%, 12%, 13%, 14%]

  // Get seller's tree node
  const sellerNode = await prisma.treeNode.findUnique({
    where: { associateId: sellerAssociateId },
  });

  if (!sellerNode) {
    return { sellerCommission: sellerRecord, uplineCommissions: [], totalDistributed };
  }

  let currentNode = sellerNode;
  const uplineCommissions = [];
  let lastPaidRank = sellerRank; // Track the last rank that received commission

  for (let level = 1; level <= 10; level++) {
    if (!currentNode.parentId) break;

    const parentNode = await prisma.treeNode.findUnique({
      where: { id: currentNode.parentId },
    });
    if (!parentNode) break;

    // Check if the ancestor associate is ACTIVE and get their rank
    const ancestor = await prisma.associate.findUnique({
      where: { id: parentNode.associateId },
      select: { id: true, status: true, rank: true },
    });

    if (!ancestor || ancestor.status !== 'ACTIVE') {
      currentNode = parentNode;
      continue;
    }

    const ancestorRank = ancestor.rank || 1;

    // Skip if ancestor's rank is not higher than last paid rank (no gap to earn)
    if (ancestorRank <= lastPaidRank && ancestorRank < 10) {
      currentNode = parentNode;
      continue;
    }

    let gapPercent = 0;

    if (ancestorRank >= 10) {
      // President Club always gets flat 2%
      gapPercent = presidentClubFlat;
    } else {
      // Gap = ancestor's rank slab % - last paid rank's slab %
      const ancestorSlabPercent = slabPercentages[ancestorRank - 1] || 0;
      const lastPaidSlabPercent = slabPercentages[lastPaidRank - 1] || 0;
      gapPercent = ancestorSlabPercent - lastPaidSlabPercent;
    }

    if (gapPercent <= 0) {
      currentNode = parentNode;
      continue;
    }

    const commissionAmount = (commissionablePrice * gapPercent) / 100;

    const record = await prisma.propertySaleCommission.create({
      data: {
        propertyId,
        bookingId,
        associateId: ancestor.id,
        sellerAssociateId,
        level,
        percentage: gapPercent,
        propertyPrice,
        propertyArea: propertyAreaGaj,
        commissionAmount: commissionAmount / 100, // Stored in IWR Coins
        status: 'PENDING',
      },
    });

    uplineCommissions.push(record);
    totalDistributed += commissionAmount;

    // Update last paid rank (President Club doesn't affect this since it's flat)
    if (ancestorRank < 10) {
      lastPaidRank = ancestorRank;
    }

    currentNode = parentNode;
  }

  console.log(`[COMMISSION] Property sale: ₹${propertyPrice} (After TDS: ₹${commissionablePrice}) | Area: ${propertyAreaGaj} gaj | Distributed: ₹${totalDistributed.toFixed(2)} across ${1 + uplineCommissions.length} associates`);

  // 4. Record sale area and check promotion
  try {
    const { recordSaleAndCheckPromotion } = await import('./promotion.service.js');
    await recordSaleAndCheckPromotion(sellerAssociateId, propertyAreaGaj);
  } catch (err) {
    console.error('[COMMISSION] Promotion check failed (non-blocking):', err.message);
  }

  return {
    sellerCommission: sellerRecord,
    uplineCommissions,
    totalDistributed,
  };
}

// ─── Get Commission History for Associate ─────────────────────────────────────

/**
 * Get all property sale commissions earned by an associate.
 * @param {string} associateId
 * @param {object} pagination
 */
export async function getPropertyCommissions(associateId, pagination = {}) {
  const { skip = 0, take = 20, page = 1, pageSize = 20 } = pagination;

  const [records, totalItems] = await Promise.all([
    prisma.propertySaleCommission.findMany({
      where: { associateId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.propertySaleCommission.count({ where: { associateId } }),
  ]);

  return { items: records, totalItems, page, pageSize };
}

// ─── Admin: Get All Pending Commissions ───────────────────────────────────────

export async function getPendingPropertyCommissions(pagination = {}) {
  const { skip = 0, take = 20, page = 1, pageSize = 20 } = pagination;

  const [records, totalItems] = await Promise.all([
    prisma.propertySaleCommission.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.propertySaleCommission.count({ where: { status: 'PENDING' } }),
  ]);

  const populated = await Promise.all(
    records.map(async (rec) => {
      const assoc = await prisma.associate.findUnique({
        where: { id: rec.associateId },
        select: { userId: true, name: true, rank: true },
      });
      return {
        ...rec,
        associateCode: assoc?.userId || null,
        associateName: assoc?.name || null,
        associateRank: assoc?.rank || null,
        associateRankName: assoc ? (RANK_NAMES[assoc.rank] || 'Unknown') : null,
      };
    })
  );

  return { items: populated, totalItems, page, pageSize };
}

// ─── Admin: Approve Commission (credit to wallet) ─────────────────────────────

export async function approvePropertyCommission(commissionId, adminId) {
  const commission = await prisma.propertySaleCommission.findUnique({
    where: { id: commissionId },
  });

  if (!commission) throw Object.assign(new Error('Commission not found'), { statusCode: 404 });
  if (commission.status !== 'PENDING') throw Object.assign(new Error('Commission already processed'), { statusCode: 400 });

  // Credit to associate's wallet (converted from IWR Coins back to Rupees)
  const { creditWallet } = await import('./wallet.service.js');
  await prisma.$transaction(async (tx) => {
    // Update status inside the transaction to ensure atomicity
    await tx.propertySaleCommission.update({
      where: { id: commissionId },
      data: { status: 'APPROVED' },
    });

    await creditWallet(
      tx,
      commission.associateId,
      Number(commission.commissionAmount) * 100,
      'DIRECT_INCOME',
      `Property sale commission (Level ${commission.level}, Area: ${commission.propertyArea} gaj)`,
      commission.propertyId,
      adminId,
      'Property sale commission approved',
    );
  });

  return { success: true };
}
