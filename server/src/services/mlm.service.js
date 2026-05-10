import prisma from '../utils/prisma.js';

// ─── calculateDirectIncome ────────────────────────────────────────────────────

/**
 * Calculate and record direct income for the sponsor when a new member activates.
 * @param {string} sponsorId       - Associate.id of the sponsor
 * @param {string} packageId       - Package.id purchased by the new member
 * @param {string} newAssociateId  - Associate.id of the newly activated member (sourceId)
 */
export async function calculateDirectIncome(sponsorId, packageId, newAssociateId) {
  const [sponsor, pkg, plan] = await Promise.all([
    prisma.associate.findUnique({ where: { id: sponsorId } }),
    prisma.package.findUnique({ where: { id: packageId } }),
    prisma.incomePlan.findFirst({
      where: { type: 'DIRECT', isActive: true },
    }),
  ]);

  if (!sponsor) throw Object.assign(new Error('Sponsor not found'), { statusCode: 404 });
  if (!pkg) throw Object.assign(new Error('Package not found'), { statusCode: 404 });
  if (!plan) {
    // No active direct income plan — skip silently
    return null;
  }

  const directIncome = Number(pkg.price) * (Number(plan.percentage) / 100);

  const incomeRecord = await prisma.incomeRecord.create({
    data: {
      associateId: sponsor.id,
      type: 'DIRECT',
      amount: directIncome,
      sourceId: newAssociateId,
      status: 'PENDING',
    },
  });

  return incomeRecord;
}

// ─── calculateLevelIncome ─────────────────────────────────────────────────────

/**
 * Walk UP the tree from the new associate and create level income records
 * for each ancestor up to level 5.
 * @param {string} newAssociateId - Associate.id of the newly activated member
 * @returns {IncomeRecord[]}
 */
export async function calculateLevelIncome(newAssociateId) {
  const newAssociate = await prisma.associate.findUnique({
    where: { id: newAssociateId },
    include: {
      treeNode: true,
      package: true,
    },
  });

  if (!newAssociate) throw Object.assign(new Error('Associate not found'), { statusCode: 404 });
  if (!newAssociate.treeNode) return [];
  if (!newAssociate.package) return [];

  const packagePrice = Number(newAssociate.package.price);
  const incomeRecords = [];
  const MAX_LEVELS = 5;

  let currentNode = newAssociate.treeNode;
  let levelN = 1; // 1-indexed from new associate upward

  while (levelN <= MAX_LEVELS && currentNode.parentId) {
    const parentNode = await prisma.treeNode.findUnique({
      where: { id: currentNode.parentId },
      include: {
        associate: true,
      },
    });

    if (!parentNode) break;

    // Find the level income plan for this level
    const plan = await prisma.incomePlan.findFirst({
      where: { type: 'LEVEL', level: levelN, isActive: true },
    });

    if (plan) {
      const levelIncome = packagePrice * (Number(plan.percentage) / 100);

      const record = await prisma.incomeRecord.create({
        data: {
          associateId: parentNode.associateId,
          type: 'LEVEL',
          amount: levelIncome,
          sourceId: newAssociateId,
          status: 'PENDING',
        },
      });

      incomeRecords.push(record);
    }

    currentNode = parentNode;
    levelN += 1;
  }

  return incomeRecords;
}

// ─── calculateMatchingIncome ──────────────────────────────────────────────────

/**
 * Calculate binary matching income for an associate based on paired volume.
 * Updates carryForward on the TreeNode.
 * @param {string} associateId
 * @returns {IncomeRecord}
 */
export async function calculateMatchingIncome(associateId) {
  const treeNode = await prisma.treeNode.findUnique({
    where: { associateId },
  });

  if (!treeNode) {
    throw Object.assign(new Error('Tree node not found'), { statusCode: 404 });
  }

  const plan = await prisma.incomePlan.findFirst({
    where: { type: 'MATCHING', isActive: true },
  });

  if (!plan) return null;

  const leftVolume = Number(treeNode.leftVolume);
  const rightVolume = Number(treeNode.rightVolume);

  const pairedVolume = Math.min(leftVolume, rightVolume);
  const matchingIncome = pairedVolume * (Number(plan.percentage) / 100);
  const newCarryForward = Math.abs(leftVolume - rightVolume);

  // Update carryForward and create income record in a transaction
  const [, incomeRecord] = await prisma.$transaction([
    prisma.treeNode.update({
      where: { associateId },
      data: { carryForward: newCarryForward },
    }),
    prisma.incomeRecord.create({
      data: {
        associateId,
        type: 'MATCHING',
        amount: matchingIncome,
        sourceId: null,
        status: 'PENDING',
      },
    }),
  ]);

  return incomeRecord;
}

// ─── calculateRewardIncome ────────────────────────────────────────────────────

/**
 * Check if the associate has crossed any reward milestones and create records.
 * @param {string} associateId
 * @returns {IncomeRecord[]}
 */
export async function calculateRewardIncome(associateId) {
  // Get total business volume: sum of all package prices in the downline
  // We sum the package prices of all ACTIVE associates in the downline
  const downlineAssociates = await getDownlineAssociateIds(associateId);

  const packages = await prisma.associate.findMany({
    where: {
      id: { in: downlineAssociates },
      status: 'ACTIVE',
      packageId: { not: null },
    },
    include: { package: { select: { price: true } } },
  });

  const totalVolume = packages.reduce((sum, a) => sum + Number(a.package?.price || 0), 0);

  // Get all active reward plans
  const rewardPlans = await prisma.incomePlan.findMany({
    where: { type: 'REWARD', isActive: true },
    orderBy: { milestone: 'asc' },
  });

  if (rewardPlans.length === 0) return [];

  // Get existing PAID reward records for this associate to avoid duplicates
  const existingPaidRecords = await prisma.incomeRecord.findMany({
    where: {
      associateId,
      type: 'REWARD',
      status: 'PAID',
    },
    select: { amount: true },
  });

  const paidAmounts = new Set(existingPaidRecords.map((r) => Number(r.amount)));

  const newRecords = [];

  for (const plan of rewardPlans) {
    const milestone = Number(plan.milestone);
    const rewardAmount = Number(plan.rewardAmount);

    if (totalVolume >= milestone && !paidAmounts.has(rewardAmount)) {
      const record = await prisma.incomeRecord.create({
        data: {
          associateId,
          type: 'REWARD',
          amount: rewardAmount,
          sourceId: null,
          status: 'PENDING',
        },
      });
      newRecords.push(record);
    }
  }

  return newRecords;
}

// ─── updateBusinessVolumes ────────────────────────────────────────────────────

/**
 * Walk UP the tree from the new associate and increment leftVolume or rightVolume
 * on each ancestor depending on which subtree the new associate is in.
 * All updates run inside a Prisma $transaction.
 * @param {string} newAssociateId
 * @param {number} packagePrice
 */
export async function updateBusinessVolumes(newAssociateId, packagePrice) {
  const newAssociateTN = await prisma.treeNode.findUnique({
    where: { associateId: newAssociateId },
  });

  if (!newAssociateTN) return;

  // Walk up and collect { nodeId, side } pairs
  const updates = []; // { nodeId, side: 'left'|'right' }

  let currentNode = newAssociateTN;

  while (currentNode.parentId) {
    const parentNode = await prisma.treeNode.findUnique({
      where: { id: currentNode.parentId },
    });

    if (!parentNode) break;

    // Determine which side of the parent the current node is on
    const side = parentNode.leftChildId === currentNode.id ? 'left' : 'right';
    updates.push({ nodeId: parentNode.id, side });

    currentNode = parentNode;
  }

  if (updates.length === 0) return;

  // Execute all volume increments in a single transaction
  await prisma.$transaction(
    updates.map(({ nodeId, side }) =>
      prisma.treeNode.update({
        where: { id: nodeId },
        data:
          side === 'left'
            ? { leftVolume: { increment: packagePrice } }
            : { rightVolume: { increment: packagePrice } },
      }),
    ),
  );
}

// ─── Internal helper ──────────────────────────────────────────────────────────

/**
 * BFS to collect all descendant associate IDs (including self).
 */
async function getDownlineAssociateIds(associateId) {
  const rootNode = await prisma.treeNode.findUnique({
    where: { associateId },
  });

  if (!rootNode) return [associateId];

  const ids = [associateId];
  const queue = [rootNode];

  while (queue.length > 0) {
    const node = queue.shift();

    if (node.leftChildId) {
      const left = await prisma.treeNode.findUnique({ where: { id: node.leftChildId } });
      if (left) {
        ids.push(left.associateId);
        queue.push(left);
      }
    }

    if (node.rightChildId) {
      const right = await prisma.treeNode.findUnique({ where: { id: node.rightChildId } });
      if (right) {
        ids.push(right.associateId);
        queue.push(right);
      }
    }
  }

  return ids;
}
