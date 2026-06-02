import prisma from '../../utils/prisma.js';

// ─── getJoiningReport ─────────────────────────────────────────────────────────

/**
 * Return paginated associates who joined within the given date range.
 * @param {string|null} startDate
 * @param {string|null} endDate
 * @param {{ page, pageSize, skip, take }} pagination
 */
export async function getJoiningReport(startDate, endDate, pagination) {
  const { page, pageSize, skip, take } = pagination;

  const where = {};
  if (startDate || endDate) {
    where.joiningDate = {};
    if (startDate) where.joiningDate.gte = new Date(startDate);
    if (endDate) where.joiningDate.lte = new Date(endDate);
  }

  const [records, totalItems] = await Promise.all([
    prisma.associate.findMany({
      where,
      orderBy: { joiningDate: 'desc' },
      skip,
      take,
      select: {
        id: true,
        userId: true,
        name: true,
        email: true,
        phone: true,
        joiningDate: true,
        sponsorId: true,
        sponsor: { select: { userId: true } },
        package: { select: { name: true } },
      },
    }),
    prisma.associate.count({ where }),
  ]);

  const items = records.map((r) => ({
    userId: r.userId,
    name: r.name,
    email: r.email,
    phone: r.phone,
    joiningDate: r.joiningDate,
    packageName: r.package?.name ?? null,
    sponsorUserId: r.sponsor?.userId ?? null,
  }));

  return { items, totalItems, page, pageSize };
}

// ─── getActivationReport ──────────────────────────────────────────────────────

/**
 * Return paginated associates activated within the given date range.
 * @param {string|null} startDate
 * @param {string|null} endDate
 * @param {{ page, pageSize, skip, take }} pagination
 */
export async function getActivationReport(startDate, endDate, pagination) {
  const { page, pageSize, skip, take } = pagination;

  const where = { activationDate: { not: null } };
  if (startDate || endDate) {
    where.activationDate = {};
    if (startDate) where.activationDate.gte = new Date(startDate);
    if (endDate) where.activationDate.lte = new Date(endDate);
  }

  const [records, totalItems] = await Promise.all([
    prisma.associate.findMany({
      where,
      orderBy: { activationDate: 'desc' },
      skip,
      take,
      select: {
        userId: true,
        name: true,
        activationDate: true,
        package: { select: { name: true } },
      },
    }),
    prisma.associate.count({ where }),
  ]);

  const items = records.map((r) => ({
    userId: r.userId,
    name: r.name,
    activationDate: r.activationDate,
    packageName: r.package?.name ?? null,
  }));

  return { items, totalItems, page, pageSize };
}

// ─── getIncomeReport ──────────────────────────────────────────────────────────

/**
 * Return paginated IncomeRecords filtered by type and date range.
 * @param {string|null} type - IncomeType enum value
 * @param {string|null} startDate
 * @param {string|null} endDate
 * @param {{ page, pageSize, skip, take }} pagination
 */
export async function getIncomeReport(type, startDate, endDate, pagination) {
  const { page, pageSize, skip, take } = pagination;

  const where = {};
  if (type) where.type = type;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [records, totalItems] = await Promise.all([
    prisma.incomeRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      select: {
        id: true,
        type: true,
        amount: true,
        status: true,
        createdAt: true,
        associate: { select: { userId: true, name: true } },
      },
    }),
    prisma.incomeRecord.count({ where }),
  ]);

  const items = records.map((r) => ({
    id: r.id,
    type: r.type,
    amount: Number(r.amount),
    status: r.status,
    createdAt: r.createdAt,
    userId: r.associate.userId,
    name: r.associate.name,
  }));

  return { items, totalItems, page, pageSize };
}

// ─── getWithdrawalReport ──────────────────────────────────────────────────────

/**
 * Return paginated WithdrawalRequests filtered by status and date range.
 * @param {string|null} status - WithdrawalStatus enum value
 * @param {string|null} startDate
 * @param {string|null} endDate
 * @param {{ page, pageSize, skip, take }} pagination
 */
export async function getWithdrawalReport(status, startDate, endDate, pagination) {
  const { page, pageSize, skip, take } = pagination;

  const where = {};
  if (status) where.status = status;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [records, totalItems] = await Promise.all([
    prisma.withdrawalRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      select: {
        id: true,
        amount: true,
        status: true,
        transactionRef: true,
        createdAt: true,
        processedAt: true,
        associateId: true,
      },
    }),
    prisma.withdrawalRequest.count({ where }),
  ]);

  // Fetch associate info for each record
  const associateIds = [...new Set(records.map((r) => r.associateId))];
  const associates = await prisma.associate.findMany({
    where: { id: { in: associateIds } },
    select: { id: true, userId: true, name: true },
  });
  const associateMap = Object.fromEntries(associates.map((a) => [a.id, a]));

  const items = records.map((r) => ({
    id: r.id,
    amount: Number(r.amount),
    status: r.status,
    transactionRef: r.transactionRef,
    createdAt: r.createdAt,
    processedAt: r.processedAt,
    userId: associateMap[r.associateId]?.userId ?? null,
    name: associateMap[r.associateId]?.name ?? null,
  }));

  return { items, totalItems, page, pageSize };
}

// ─── getFundTransferReport ────────────────────────────────────────────────────

/**
 * Return paginated Transactions of type FUND_TRANSFER_IN or FUND_TRANSFER_OUT.
 * @param {string|null} startDate
 * @param {string|null} endDate
 * @param {{ page, pageSize, skip, take }} pagination
 */
export async function getFundTransferReport(startDate, endDate, pagination) {
  const { page, pageSize, skip, take } = pagination;

  const where = {
    type: { in: ['FUND_TRANSFER_IN', 'FUND_TRANSFER_OUT'] },
  };
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [records, totalItems] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      select: {
        id: true,
        type: true,
        amount: true,
        description: true,
        reference: true,
        createdAt: true,
        wallet: {
          select: {
            associate: { select: { userId: true } },
          },
        },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  const items = records.map((r) => ({
    id: r.id,
    type: r.type,
    amount: Number(r.amount),
    description: r.description,
    // For OUT: reference = recipient userId; for IN: reference = sender userId
    senderUserId: r.type === 'FUND_TRANSFER_OUT' ? r.wallet.associate.userId : r.reference,
    recipientUserId: r.type === 'FUND_TRANSFER_IN' ? r.wallet.associate.userId : r.reference,
    createdAt: r.createdAt,
  }));

  return { items, totalItems, page, pageSize };
}

// ─── getUserWiseReport ────────────────────────────────────────────────────────

/**
 * Return complete financial history for one associate.
 * @param {string} associateId - associate UUID
 */
export async function getUserWiseReport(associateId) {
  const associate = await prisma.associate.findUnique({
    where: { id: associateId },
    select: { id: true, userId: true, name: true, email: true },
  });

  if (!associate) {
    throw Object.assign(new Error('Associate not found'), { statusCode: 404 });
  }

  const wallet = await prisma.wallet.findUnique({
    where: { associateId },
    select: { id: true },
  });

  const [incomeRecords, withdrawalRequests, fundTransactions] = await Promise.all([
    prisma.incomeRecord.findMany({
      where: { associateId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        amount: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.withdrawalRequest.findMany({
      where: { associateId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        status: true,
        transactionRef: true,
        createdAt: true,
        processedAt: true,
      },
    }),
    wallet
      ? prisma.transaction.findMany({
          where: {
            walletId: wallet.id,
            type: { in: ['FUND_TRANSFER_IN', 'FUND_TRANSFER_OUT'] },
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            type: true,
            amount: true,
            reference: true,
            createdAt: true,
          },
        })
      : [],
  ]);

  return {
    associate: {
      userId: associate.userId,
      name: associate.name,
      email: associate.email,
    },
    incomeRecords: incomeRecords.map((r) => ({ ...r, amount: Number(r.amount) })),
    withdrawalRequests: withdrawalRequests.map((r) => ({ ...r, amount: Number(r.amount) })),
    fundTransactions: fundTransactions.map((r) => ({ ...r, amount: Number(r.amount) })),
  };
}

// ─── getRankAchieversReport ────────────────────────────────────────────────────

/**
 * Return paginated associates who have achieved a specific rank.
 * @param {number} rank - Rank number (1-10)
 * @param {{ page, pageSize, skip, take }} pagination
 */
export async function getRankAchieversReport(rank, pagination) {
  const { page, pageSize, skip, take } = pagination;

  const where = { rank, deletedAt: null };

  const [records, totalItems] = await Promise.all([
    prisma.associate.findMany({
      where,
      orderBy: { activationDate: 'desc' },
      skip,
      take,
      select: {
        userId: true,
        name: true,
        email: true,
        phone: true,
        rank: true,
        totalAreaSold: true,
        status: true,
        joiningDate: true,
        activationDate: true,
        sponsor: { select: { userId: true, name: true } },
      },
    }),
    prisma.associate.count({ where }),
  ]);

  const RANK_NAMES = [
    '', 'Business Associate', 'Business Adviser', 'Business Head',
    'Dist. Business Head', 'State Business Head', 'Regional Business Head',
    'National Business Head', 'Vice President Sales', 'President Sales', 'President Club',
  ];

  const items = records.map((r) => ({
    userId: r.userId,
    name: r.name,
    email: r.email,
    phone: r.phone,
    rank: r.rank,
    rankName: RANK_NAMES[r.rank] || 'Unknown',
    totalAreaSold: r.totalAreaSold,
    status: r.status,
    joiningDate: r.joiningDate,
    activationDate: r.activationDate,
    sponsorUserId: r.sponsor?.userId ?? null,
    sponsorName: r.sponsor?.name ?? null,
  }));

  return { items, totalItems, page, pageSize };
}
