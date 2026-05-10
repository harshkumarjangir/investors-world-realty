import prisma from '../../utils/prisma.js';

export async function listAllTransactions(filters, pagination) {
  const { startDate, endDate, type, associateId, status } = filters;
  const { page, pageSize, skip, take } = pagination;

  const where = {};
  if (type) where.type = type;
  if (status) where.status = status;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }
  if (associateId) {
    const wallet = await prisma.wallet.findUnique({ where: { associateId }, select: { id: true } });
    if (wallet) where.walletId = wallet.id;
    else return { items: [], totalItems: 0, page, pageSize };
  }

  const [records, totalItems] = await Promise.all([
    prisma.transaction.findMany({
      where, orderBy: { createdAt: 'desc' }, skip, take,
      select: {
        id: true, type: true, amount: true, balanceAfter: true,
        description: true, reference: true, status: true, createdAt: true,
        wallet: { select: { associate: { select: { userId: true, name: true } } } },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  const items = records.map((r) => ({
    id: r.id, type: r.type, amount: Number(r.amount),
    balanceAfter: Number(r.balanceAfter), description: r.description,
    reference: r.reference, status: r.status, createdAt: r.createdAt,
    associateUserId: r.wallet.associate.userId,
    associateName: r.wallet.associate.name,
  }));

  return { items, totalItems, page, pageSize };
}

export async function getWalletTransactions(associateId, pagination) {
  const { page, pageSize, skip, take } = pagination;
  const wallet = await prisma.wallet.findUnique({ where: { associateId }, select: { id: true } });
  if (!wallet) throw Object.assign(new Error('Wallet not found'), { statusCode: 404 });

  const [records, totalItems] = await Promise.all([
    prisma.transaction.findMany({
      where: { walletId: wallet.id }, orderBy: { createdAt: 'desc' }, skip, take,
      select: { id: true, type: true, amount: true, balanceAfter: true, description: true, reference: true, status: true, createdAt: true },
    }),
    prisma.transaction.count({ where: { walletId: wallet.id } }),
  ]);

  return { items: records.map((r) => ({ ...r, amount: Number(r.amount), balanceAfter: Number(r.balanceAfter) })), totalItems, page, pageSize };
}

export async function listWithdrawalRequests(filters, pagination) {
  const { status, startDate, endDate } = filters;
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
      where, orderBy: { createdAt: 'desc' }, skip, take,
      select: { id: true, amount: true, status: true, transactionRef: true, createdAt: true, processedAt: true, rejectionReason: true, associateId: true },
    }),
    prisma.withdrawalRequest.count({ where }),
  ]);

  const associateIds = [...new Set(records.map((r) => r.associateId))];
  const associates = await prisma.associate.findMany({ where: { id: { in: associateIds } }, select: { id: true, userId: true, name: true } });
  const aMap = Object.fromEntries(associates.map((a) => [a.id, a]));

  return {
    items: records.map((r) => ({
      id: r.id, amount: Number(r.amount), status: r.status,
      transactionRef: r.transactionRef, createdAt: r.createdAt,
      processedAt: r.processedAt, rejectionReason: r.rejectionReason,
      userId: aMap[r.associateId]?.userId, name: aMap[r.associateId]?.name,
    })),
    totalItems, page, pageSize,
  };
}

export async function approveWithdrawal(id, adminId) {
  const req = await prisma.withdrawalRequest.findUnique({ where: { id } });
  if (!req) throw Object.assign(new Error('Withdrawal request not found'), { statusCode: 404 });
  if (req.status !== 'PENDING') throw Object.assign(new Error('Request is not pending'), { statusCode: 400 });

  return prisma.withdrawalRequest.update({
    where: { id },
    data: { status: 'APPROVED', processedBy: adminId, processedAt: new Date() },
  });
}

export async function rejectWithdrawal(id, reason, adminId) {
  const req = await prisma.withdrawalRequest.findUnique({ where: { id } });
  if (!req) throw Object.assign(new Error('Withdrawal request not found'), { statusCode: 404 });
  if (req.status !== 'PENDING') throw Object.assign(new Error('Request is not pending'), { statusCode: 400 });

  return prisma.withdrawalRequest.update({
    where: { id },
    data: { status: 'REJECTED', rejectionReason: reason, processedBy: adminId, processedAt: new Date() },
  });
}
