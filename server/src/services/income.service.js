import prisma from '../utils/prisma.js';

// ─── getIncomeSummary ─────────────────────────────────────────────────────────

/**
 * Return income totals grouped by type (PAID + APPROVED amounts only).
 * @param {string} associateId
 * @returns {{ direct, level, matching, reward, total }}
 */
export async function getIncomeSummary(associateId) {
  const records = await prisma.incomeRecord.findMany({
    where: {
      associateId,
      status: { in: ['PAID', 'APPROVED'] },
    },
    select: { type: true, amount: true },
  });

  const summary = { direct: 0, level: 0, matching: 0, reward: 0, total: 0 };

  for (const record of records) {
    const amount = Number(record.amount);
    switch (record.type) {
      case 'DIRECT':
        summary.direct += amount;
        break;
      case 'LEVEL':
        summary.level += amount;
        break;
      case 'MATCHING':
        summary.matching += amount;
        break;
      case 'REWARD':
        summary.reward += amount;
        break;
      default:
        break;
    }
    summary.total += amount;
  }

  return summary;
}

// ─── getIncomeHistory ─────────────────────────────────────────────────────────

/**
 * Return paginated income records with source associate's userId.
 * @param {string} associateId
 * @param {{ page, pageSize, skip, take }} pagination
 */
export async function getIncomeHistory(associateId, pagination = {}) {
  const { page = 1, pageSize = 20, skip = 0, take = 20 } = pagination;

  const [records, totalItems] = await Promise.all([
    prisma.incomeRecord.findMany({
      where: { associateId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      select: {
        id: true,
        type: true,
        amount: true,
        status: true,
        sourceId: true,
        createdAt: true,
      },
    }),
    prisma.incomeRecord.count({ where: { associateId } }),
  ]);

  // Resolve sourceId → source associate's userId
  const sourceIds = [...new Set(records.map((r) => r.sourceId).filter(Boolean))];

  let sourceMap = new Map();
  if (sourceIds.length > 0) {
    const sources = await prisma.associate.findMany({
      where: { id: { in: sourceIds } },
      select: { id: true, userId: true },
    });
    sourceMap = new Map(sources.map((s) => [s.id, s.userId]));
  }

  const items = records.map((r) => ({
    id: r.id,
    date: r.createdAt,
    type: r.type,
    amount: Number(r.amount),
    sourceUserId: r.sourceId ? (sourceMap.get(r.sourceId) || null) : null,
    status: r.status,
  }));

  return { items, totalItems, page, pageSize };
}

// ─── calculateProjectedCommissions ───────────────────────────────────────────

/**
 * Simulate projected commissions based on active IncomePlan config.
 * @param {number} referrals  - Number of direct referrals per person
 * @param {number} depth      - Levels deep to simulate
 * @param {string} packageId  - Package to use for price
 * @returns {{ direct, level, matching, reward, total, assumptions }}
 */
export async function calculateProjectedCommissions(referrals, depth, packageId) {
  const refCount = Math.max(parseInt(referrals, 10) || 2, 1);
  const depthCount = Math.min(Math.max(parseInt(depth, 10) || 3, 1), 10);

  // Fetch package
  const pkg = await prisma.package.findUnique({ where: { id: packageId } });
  if (!pkg || !pkg.isActive) {
    throw Object.assign(new Error('Package not found or inactive'), { statusCode: 404 });
  }

  const packagePrice = Number(pkg.price);

  // Fetch all active income plans
  const plans = await prisma.incomePlan.findMany({
    where: { isActive: true },
  });

  const directPlan = plans.find((p) => p.type === 'DIRECT');
  const levelPlans = plans.filter((p) => p.type === 'LEVEL');
  const matchingPlan = plans.find((p) => p.type === 'MATCHING');
  const rewardPlans = plans.filter((p) => p.type === 'REWARD');

  // ── Direct income ──────────────────────────────────────────────────────────
  // You personally refer `refCount` people
  const directIncome = directPlan
    ? refCount * packagePrice * (Number(directPlan.percentage) / 100)
    : 0;

  // ── Level income ───────────────────────────────────────────────────────────
  // At level N, there are refCount^N members (each referred by the level above)
  let levelIncome = 0;
  for (let lvl = 1; lvl <= depthCount; lvl++) {
    const plan = levelPlans.find((p) => p.level === lvl);
    if (plan) {
      const membersAtLevel = Math.pow(refCount, lvl);
      levelIncome += membersAtLevel * packagePrice * (Number(plan.percentage) / 100);
    }
  }

  // ── Matching income ────────────────────────────────────────────────────────
  // Assume balanced tree: leftVolume = rightVolume = total volume / 2
  let matchingIncome = 0;
  if (matchingPlan) {
    let totalMembers = 0;
    for (let lvl = 1; lvl <= depthCount; lvl++) {
      totalMembers += Math.pow(refCount, lvl);
    }
    const totalVolume = totalMembers * packagePrice;
    const pairedVolume = totalVolume / 2; // balanced assumption
    matchingIncome = pairedVolume * (Number(matchingPlan.percentage) / 100);
  }

  // ── Reward income ──────────────────────────────────────────────────────────
  let rewardIncome = 0;
  let totalVolumeForReward = 0;
  for (let lvl = 1; lvl <= depthCount; lvl++) {
    totalVolumeForReward += Math.pow(refCount, lvl) * packagePrice;
  }

  for (const plan of rewardPlans) {
    if (totalVolumeForReward >= Number(plan.milestone)) {
      rewardIncome += Number(plan.rewardAmount);
    }
  }

  const total = directIncome + levelIncome + matchingIncome + rewardIncome;

  return {
    direct: parseFloat(directIncome.toFixed(2)),
    level: parseFloat(levelIncome.toFixed(2)),
    matching: parseFloat(matchingIncome.toFixed(2)),
    reward: parseFloat(rewardIncome.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    assumptions: {
      referrals: refCount,
      depth: depthCount,
      packageName: pkg.name,
      packagePrice,
      treeType: 'balanced binary',
      note: 'Projections are estimates based on current income plan configuration and assume a perfectly balanced binary tree.',
    },
  };
}
