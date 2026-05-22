import prisma from '../utils/prisma.js';

/**
 * Property Sale Commission Engine
 * 
 * When a property is sold (booking confirmed), this calculates commission for:
 * - The selling associate (level 0)
 * - Up to 10 levels of upline ancestors in the binary tree
 * 
 * Commission % is determined by property area (gaj) slabs.
 */

/**
 * Find the matching commission slab for a given property area.
 * @param {number} areaInGaj - Property area in gaj/sq yards
 * @returns {object|null} Matching PropertyCommissionSlab
 */
export async function findCommissionSlab(areaInGaj) {
  const slab = await prisma.propertyCommissionSlab.findFirst({
    where: {
      isActive: true,
      minArea: { lte: areaInGaj },
      maxArea: { gte: areaInGaj },
    },
  });
  return slab;
}

/**
 * Calculate and record commissions for a property sale.
 * Called when a booking is confirmed (property sold).
 * 
 * @param {string} sellerAssociateId - The associate who sold the property
 * @param {string} propertyId - The property that was sold
 * @param {string} bookingId - The booking record
 * @param {number} propertyPrice - Sale price of the property
 * @param {number} propertyAreaGaj - Area of the property in gaj
 * @returns {Array} Created commission records
 */
export async function calculatePropertySaleCommission(
  sellerAssociateId,
  propertyId,
  bookingId,
  propertyPrice,
  propertyAreaGaj,
) {
  // 1. Find the matching slab
  const slab = await findCommissionSlab(propertyAreaGaj);
  if (!slab) {
    console.warn(`[COMMISSION] No slab found for area ${propertyAreaGaj} gaj`);
    return [];
  }

  const commissions = [];

  // 2. Seller commission (level 0)
  const sellerAmount = propertyPrice * Number(slab.sellerPercent) / 100;
  commissions.push({
    propertyId,
    bookingId,
    associateId: sellerAssociateId,
    sellerAssociateId,
    level: 0,
    percentage: Number(slab.sellerPercent),
    propertyPrice,
    propertyArea: propertyAreaGaj,
    commissionAmount: sellerAmount,
    status: 'PENDING',
  });

  // 3. Walk UP the tree for 10 levels of upline
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

  if (sellerNode) {
    let currentNode = sellerNode;
    let levelN = 1;

    while (levelN <= 10 && currentNode.parentId) {
      const parentNode = await prisma.treeNode.findUnique({
        where: { id: currentNode.parentId },
        include: { associate: { select: { id: true, status: true } } },
      });

      if (!parentNode) break;

      // Only give commission to ACTIVE associates
      if (parentNode.associate.status === 'ACTIVE') {
        const percent = levelPercentages[levelN - 1] || 0;
        const amount = propertyPrice * percent / 100;

        if (amount > 0) {
          commissions.push({
            propertyId,
            bookingId,
            associateId: parentNode.associateId,
            sellerAssociateId,
            level: levelN,
            percentage: percent,
            propertyPrice,
            propertyArea: propertyAreaGaj,
            commissionAmount: amount,
            status: 'PENDING',
          });
        }
      }

      currentNode = parentNode;
      levelN++;
    }
  }

  // 4. Save all commission records in a single transaction
  const created = await prisma.$transaction(
    commissions.map((c) => prisma.propertySaleCommission.create({ data: c })),
  );

  console.log(`[COMMISSION] Property sale: ${created.length} commission records created for property ${propertyId} (${propertyAreaGaj} gaj, ₹${propertyPrice})`);

  return created;
}

/**
 * Get all commission records for a specific associate.
 * @param {string} associateId
 * @param {object} pagination
 */
export async function getAssociateCommissions(associateId, pagination = {}) {
  const { page = 1, pageSize = 20, skip = 0, take = 20 } = pagination;

  const [records, totalItems] = await Promise.all([
    prisma.propertySaleCommission.findMany({
      where: { associateId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.propertySaleCommission.count({ where: { associateId } }),
  ]);

  return {
    items: records.map((r) => ({
      ...r,
      commissionAmount: Number(r.commissionAmount),
      propertyPrice: Number(r.propertyPrice),
      percentage: Number(r.percentage),
    })),
    totalItems,
    page,
    pageSize,
  };
}

/**
 * Get all commission slabs (for admin config).
 */
export async function getCommissionSlabs() {
  return prisma.propertyCommissionSlab.findMany({
    orderBy: { minArea: 'asc' },
  });
}
