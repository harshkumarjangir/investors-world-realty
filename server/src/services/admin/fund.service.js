import prisma from '../../utils/prisma.js';
import { creditWallet, debitWallet } from '../wallet.service.js';
import { logAdminAction } from '../../middleware/auditLog.js';

// ─── adminCreditWallet ────────────────────────────────────────────────────────

/**
 * Admin credits an associate's wallet.
 * @param {string} associateId
 * @param {number} amount
 * @param {string} reason
 * @param {string} adminId
 * @returns {Promise<object>} Created Transaction record
 */
export async function adminCreditWallet(associateId, amount, reason, adminId) {
  const associate = await prisma.associate.findUnique({
    where: { id: associateId, deletedAt: null },
    select: { id: true, userId: true },
  });

  if (!associate) {
    throw Object.assign(new Error('Associate not found'), { statusCode: 404 });
  }

  const transaction = await prisma.$transaction(async (tx) => {
    return creditWallet(
      tx,
      associateId,
      amount,
      'ADMIN_CREDIT',
      reason,
      null,
      adminId,
      reason,
    );
  });

  await logAdminAction(adminId, 'ADMIN_CREDIT', 'Wallet', associateId, { amount, reason, associateUserId: associate.userId });

  return transaction;
}

// ─── adminDebitWallet ─────────────────────────────────────────────────────────

/**
 * Admin debits an associate's wallet.
 * @param {string} associateId
 * @param {number} amount
 * @param {string} reason
 * @param {string} adminId
 * @returns {Promise<object>} Created Transaction record
 */
export async function adminDebitWallet(associateId, amount, reason, adminId) {
  const associate = await prisma.associate.findUnique({
    where: { id: associateId, deletedAt: null },
    select: { id: true, userId: true },
  });

  if (!associate) {
    throw Object.assign(new Error('Associate not found'), { statusCode: 404 });
  }

  const transaction = await prisma.$transaction(async (tx) => {
    return debitWallet(
      tx,
      associateId,
      amount,
      'ADMIN_DEBIT',
      reason,
      null,
      adminId,
      reason,
    );
  });

  await logAdminAction(adminId, 'ADMIN_DEBIT', 'Wallet', associateId, { amount, reason, associateUserId: associate.userId });

  return transaction;
}

// ─── adminTransferBetweenWallets ──────────────────────────────────────────────

/**
 * Admin transfers funds from one associate's wallet to another atomically.
 * @param {string} fromAssociateId
 * @param {string} toAssociateId
 * @param {number} amount
 * @param {string} reason
 * @param {string} adminId
 * @returns {Promise<{ debitTransaction, creditTransaction }>}
 */
export async function adminTransferBetweenWallets(fromAssociateId, toAssociateId, amount, reason, adminId) {
  const [fromAssociate, toAssociate] = await Promise.all([
    prisma.associate.findUnique({
      where: { id: fromAssociateId, deletedAt: null },
      select: { id: true, userId: true },
    }),
    prisma.associate.findUnique({
      where: { id: toAssociateId, deletedAt: null },
      select: { id: true, userId: true },
    }),
  ]);

  if (!fromAssociate) {
    throw Object.assign(new Error('Source associate not found'), { statusCode: 404 });
  }
  if (!toAssociate) {
    throw Object.assign(new Error('Destination associate not found'), { statusCode: 404 });
  }
  if (fromAssociateId === toAssociateId) {
    throw Object.assign(new Error('Cannot transfer to the same associate'), { statusCode: 400 });
  }

  const { debitTransaction, creditTransaction } = await prisma.$transaction(async (tx) => {
    const debitTx = await debitWallet(
      tx,
      fromAssociateId,
      amount,
      'FUND_TRANSFER_OUT',
      reason,
      toAssociate.userId,
      adminId,
      reason,
    );

    const creditTx = await creditWallet(
      tx,
      toAssociateId,
      amount,
      'FUND_TRANSFER_IN',
      reason,
      fromAssociate.userId,
      adminId,
      reason,
    );

    return { debitTransaction: debitTx, creditTransaction: creditTx };
  });

  await logAdminAction(adminId, 'ADMIN_TRANSFER', 'Wallet', fromAssociateId, {
    amount,
    reason,
    fromUserId: fromAssociate.userId,
    toUserId: toAssociate.userId,
  });

  return { debitTransaction, creditTransaction };
}

// ─── getAdminFundLogs ─────────────────────────────────────────────────────────

/**
 * Return paginated Transactions where adminId is not null.
 * @param {{ associateId?, startDate?, endDate? }} filters
 * @param {{ page, pageSize, skip, take }} pagination
 */
export async function getAdminFundLogs(filters, pagination) {
  const { associateId, startDate, endDate, type } = filters;
  const { page, pageSize, skip, take } = pagination;

  // Show ALL transactions (not just admin-initiated) for the report
  const where = {};

  if (type) where.type = type;

  if (associateId) {
    // Find associate by userId string
    const assoc = await prisma.associate.findFirst({ where: { userId: associateId, deletedAt: null }, select: { id: true } });
    if (assoc) {
      const wallet = await prisma.wallet.findUnique({ where: { associateId: assoc.id }, select: { id: true } });
      if (wallet) where.walletId = wallet.id;
      else return { items: [], totalItems: 0, page, pageSize };
    } else {
      return { items: [], totalItems: 0, page, pageSize };
    }
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate + 'T00:00:00.000Z');
    if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59.999Z');
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
        balanceAfter: true,
        description: true,
        adminId: true,
        adminReason: true,
        createdAt: true,
        wallet: {
          select: {
            associate: { select: { userId: true, name: true } },
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
    balanceAfter: Number(r.balanceAfter),
    description: r.description,
    adminId: r.adminId,
    adminReason: r.adminReason,
    createdAt: r.createdAt,
    associateUserId: r.wallet.associate.userId,
    associateName: r.wallet.associate.name,
  }));

  return { items, totalItems, page, pageSize };
}

// ─── Advance Payment ──────────────────────────────────────────────────────────

/**
 * Add or deduct advance amount for an associate.
 * Maintains a running balance in AdvancePayment table.
 */
export async function adminAdvancePayment(associateId, type, amount, account, remark, date, adminId) {
  const associate = await prisma.associate.findUnique({
    where: { id: associateId, deletedAt: null },
    select: { id: true, userId: true, name: true },
  });
  if (!associate) throw Object.assign(new Error('Associate not found'), { statusCode: 404 });

  // Calculate current balance
  const agg = await prisma.advancePayment.aggregate({
    where: { associateId },
    _sum: { amount: true },
  });
  const credits = await prisma.advancePayment.aggregate({ where: { associateId, type: 'CREDIT' }, _sum: { amount: true } });
  const debits  = await prisma.advancePayment.aggregate({ where: { associateId, type: 'DEBIT'  }, _sum: { amount: true } });
  const currentBalance = Number(credits._sum.amount || 0) - Number(debits._sum.amount || 0);

  const newBalance = type === 'CREDIT'
    ? currentBalance + Number(amount)
    : currentBalance - Number(amount);

  if (type === 'DEBIT' && newBalance < 0) {
    throw Object.assign(new Error(`Insufficient advance balance. Current balance: ₹${currentBalance.toLocaleString()}`), { statusCode: 400 });
  }

  const record = await prisma.advancePayment.create({
    data: {
      associateId,
      type,
      amount: Number(amount),
      balanceAfter: newBalance,
      account: account || null,
      remark: remark || null,
      date: date ? new Date(date) : new Date(),
      adminId: adminId || null,
    },
  });

  await logAdminAction(adminId, `ADVANCE_${type}`, 'AdvancePayment', associateId, { amount, account, remark, newBalance });

  return { ...record, amount: Number(record.amount), balanceAfter: Number(record.balanceAfter), associate };
}

/**
 * Get advance payment ledger for an associate (or all associates).
 */
export async function getAdvanceLedger(filters, pagination) {
  const { associateId, startDate, endDate, type } = filters;
  const { page, pageSize, skip, take } = pagination;

  const where = {};
  if (type) where.type = type;
  if (associateId) {
    const assoc = await prisma.associate.findFirst({ where: { userId: associateId, deletedAt: null }, select: { id: true } });
    if (assoc) where.associateId = assoc.id;
    else return { items: [], totalItems: 0, page, pageSize };
  }
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate + 'T00:00:00.000Z');
    if (endDate) where.date.lte   = new Date(endDate   + 'T23:59:59.999Z');
  }

  const [records, totalItems] = await Promise.all([
    prisma.advancePayment.findMany({
      where, orderBy: { createdAt: 'desc' }, skip, take,
      include: { associate: { select: { userId: true, name: true, phone: true } } },
    }),
    prisma.advancePayment.count({ where }),
  ]);

  return {
    items: records.map(r => ({
      id: r.id,
      associateUserId: r.associate.userId,
      associateName: r.associate.name,
      associatePhone: r.associate.phone,
      type: r.type,
      amount: Number(r.amount),
      balanceAfter: Number(r.balanceAfter),
      account: r.account,
      remark: r.remark,
      date: r.date,
      createdAt: r.createdAt,
    })),
    totalItems, page, pageSize,
  };
}

/**
 * Get advance balance summary for a single associate.
 */
export async function getAdvanceBalance(associateUserId) {
  const assoc = await prisma.associate.findFirst({ where: { userId: associateUserId, deletedAt: null }, select: { id: true, userId: true, name: true } });
  if (!assoc) throw Object.assign(new Error('Associate not found'), { statusCode: 404 });

  const [credits, debits] = await Promise.all([
    prisma.advancePayment.aggregate({ where: { associateId: assoc.id, type: 'CREDIT' }, _sum: { amount: true }, _count: true }),
    prisma.advancePayment.aggregate({ where: { associateId: assoc.id, type: 'DEBIT'  }, _sum: { amount: true }, _count: true }),
  ]);

  return {
    associateId: assoc.id,
    userId: assoc.userId,
    name: assoc.name,
    totalCredit: Number(credits._sum.amount || 0),
    totalDebit:  Number(debits._sum.amount  || 0),
    balance:     Number(credits._sum.amount || 0) - Number(debits._sum.amount || 0),
    creditCount: credits._count,
    debitCount:  debits._count,
  };
}
