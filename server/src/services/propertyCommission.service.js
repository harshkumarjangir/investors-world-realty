import prisma from '../utils/prisma.js';

/**
 * Property Sale Commission Engine
 * 
 * When a property is sold/booked:
 * 1. Find the commission slab based on property area (gaj)
 * 2. Give seller their commission %
 * 3. Walk UP the tree (up to 10 levels) and give each ancestor their level %
 * 4. Downline gets nothing — only upline earns
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

  // 2. Seller commission (level 0)
  const sellerPercent = Number(slab.sellerPercent);
  const sellerAmount = (propertyPrice * sellerPercent) / 100;

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
      commissionAmount: sellerAmount,
      status: 'PENDING',
    },
  });
  commissions.push(sellerRecord);
  totalDistributed += sellerAmount;

  // 3. Walk UP the tree — give commission to each ancestor (up to 10 levels)
  const levelPercentages = [
    Number(slab.level1Percent),
    Number(slab.level2Percent),
    Number(slab.level3Percent),
    Number(slab.level4Percent),
    Number(slab.level5Percent),
    Number(slab.level6Percent),
    Number(slab.level7Percent),
    Number(slab.level8Percent),
    Number(slab.level9Percent),
    Number(slab.level10Percent),
  ];

  // Get seller's tree node
  const sellerNode = await prisma.treeNode.findUnique({
    where: { associateId: sellerAssociateId },
  });

  if (!sellerNode) {
    return { sellerCommission: sellerRecord, uplineCommissions: [], totalDistributed };
  }

  let currentNode = sellerNode;
  const uplineCommissions = [];

  for (let level = 1; level <= 10; level++) {
    if (!currentNode.parentId) break; // reached the top of the tree

    // Get parent node
    const parentNode = await prisma.treeNode.findUnique({
      where: { id: currentNode.parentId },
    });

    if (!parentNode) break;

    // Check if the ancestor associate is ACTIVE
    const ancestor = await prisma.associate.findUnique({
      where: { id: parentNode.associateId },
      select: { id: true, status: true },
    });

    if (!ancestor || ancestor.status !== 'ACTIVE') {
      // Skip inactive ancestors but continue walking up
      currentNode = parentNode;
      continue;
    }

    const levelPercent = levelPercentages[level - 1] || 0;
    if (levelPercent <= 0) {
      currentNode = parentNode;
      continue;
    }

    const commissionAmount = (propertyPrice * levelPercent) / 100;

    const record = await prisma.propertySaleCommission.create({
      data: {
        propertyId,
        bookingId,
        associateId: ancestor.id,
        sellerAssociateId,
        level,
        percentage: levelPercent,
        propertyPrice,
        propertyArea: propertyAreaGaj,
        commissionAmount,
        status: 'PENDING',
      },
    });

    uplineCommissions.push(record);
    totalDistributed += commissionAmount;
    currentNode = parentNode;
  }

  console.log(`[COMMISSION] Property sale: ₹${propertyPrice} | Area: ${propertyAreaGaj} gaj | Distributed: ₹${totalDistributed.toFixed(2)} across ${1 + uplineCommissions.length} associates`);

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

  return { items: records, totalItems, page, pageSize };
}

// ─── Admin: Approve Commission (credit to wallet) ─────────────────────────────

export async function approvePropertyCommission(commissionId, adminId) {
  const commission = await prisma.propertySaleCommission.findUnique({
    where: { id: commissionId },
  });

  if (!commission) throw Object.assign(new Error('Commission not found'), { statusCode: 404 });
  if (commission.status !== 'PENDING') throw Object.assign(new Error('Commission already processed'), { statusCode: 400 });

  // Update status
  await prisma.propertySaleCommission.update({
    where: { id: commissionId },
    data: { status: 'APPROVED' },
  });

  // Credit to associate's wallet
  const { creditWallet } = await import('./wallet.service.js');
  await prisma.$transaction(async (tx) => {
    await creditWallet(
      tx,
      commission.associateId,
      Number(commission.commissionAmount),
      'DIRECT_INCOME',
      `Property sale commission (Level ${commission.level}, Area: ${commission.propertyArea} gaj)`,
      commission.propertyId,
      adminId,
      'Property sale commission approved',
    );
  });

  return { success: true };
}
