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
  const { associateId, startDate, endDate } = filters;
  const { page, pageSize, skip, take } = pagination;

  const where = { adminId: { not: null } };

  if (associateId) {
    const wallet = await prisma.wallet.findUnique({
      where: { associateId },
      select: { id: true },
    });
    if (wallet) {
      where.walletId = wallet.id;
    } else {
      // No wallet means no transactions
      return { items: [], totalItems: 0, page, pageSize };
    }
  }

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
