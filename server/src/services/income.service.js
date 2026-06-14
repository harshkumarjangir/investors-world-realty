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


