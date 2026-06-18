import prisma from '../utils/prisma.js';
import { sendToDevices } from '../utils/firebase.js';

// ─── Internal Helpers ─────────────────────────────────────────────────────────

/**
 * Credit a wallet inside a Prisma transaction.
 * Updates balance, totalCredits, and creates a Transaction record.
 * @param {object} tx - Prisma transaction client
 * @param {string} associateId
 * @param {number} amount
 * @param {string} type - TransactionType enum value
 * @param {string} description
 * @param {string|null} reference
 * @param {string|null} adminId
 * @param {string|null} adminReason
 * @returns {Promise<object>} Created Transaction record
 */
export async function creditWallet(tx, associateId, amount, type, description, reference = null, adminId = null, adminReason = null) {
  const wallet = await tx.wallet.upsert({
    where: { associateId },
    create: {
      associateId,
      balance: amount,
      totalCredits: amount,
    },
    update: {
      balance: { increment: amount },
      totalCredits: { increment: amount },
    },
  });

  const transaction = await tx.transaction.create({
    data: {
      walletId: wallet.id,
      type,
      amount,
      balanceAfter: wallet.balance,
      description,
      reference,
      status: 'COMPLETED',
      adminId,
      adminReason,
    },
  });

  return transaction;
}

/**
 * Debit a wallet inside a Prisma transaction.
 * Validates sufficient balance, updates balance, totalDebits, and creates a Transaction record.
 * @param {object} tx - Prisma transaction client
 * @param {string} associateId
 * @param {number} amount
 * @param {string} type - TransactionType enum value
 * @param {string} description
 * @param {string|null} reference
 * @param {string|null} adminId
 * @param {string|null} adminReason
 * @returns {Promise<object>} Created Transaction record
 */
export async function debitWallet(tx, associateId, amount, type, description, reference = null, adminId = null, adminReason = null) {
  const wallet = await tx.wallet.findUnique({ where: { associateId } });
  if (!wallet) {
    throw Object.assign(new Error('Wallet not found'), { statusCode: 404 });
  }

  if (Number(wallet.balance) < amount) {
    throw Object.assign(new Error('Insufficient wallet balance'), { statusCode: 400 });
  }

  const updatedWallet = await tx.wallet.update({
    where: { associateId },
    data: {
      balance: { decrement: amount },
      totalDebits: { increment: amount },
    },
  });

  const transaction = await tx.transaction.create({
    data: {
      walletId: updatedWallet.id,
      type,
      amount,
      balanceAfter: updatedWallet.balance,
      description,
      reference,
      status: 'COMPLETED',
      adminId,
      adminReason,
    },
  });

  return transaction;
}

// ─── getBalance ───────────────────────────────────────────────────────────────

/**
 * Return wallet balance and totals for an associate.
 * @param {string} associateId
 * @returns {{ balance, totalCredits, totalDebits }}
 */
export async function getBalance(associateId) {
  const wallet = await prisma.wallet.findUnique({
    where: { associateId },
    select: { balance: true, totalCredits: true, totalDebits: true },
  });

  if (!wallet) {
    throw Object.assign(new Error('Wallet not found'), { statusCode: 404 });
  }

  return {
    balance: Number(wallet.balance),
    totalCredits: Number(wallet.totalCredits),
    totalDebits: Number(wallet.totalDebits),
  };
}

// ─── getWalletDashboard ───────────────────────────────────────────────────────

/**
 * Return aggregated dashboard data for the wallet including balance, totals, and merged recent activity.
 * @param {string} associateId
 */
export async function getWalletDashboard(associateId) {
  const balanceData = await getBalance(associateId);
  const transactions = await getTransactions(associateId, { take: 10 });
  const withdrawals = await getWithdrawals(associateId, { take: 10 });

  // Format and merge transactions and withdrawals for the frontend "Recent Transactions" list
  const formattedTx = transactions.items.map(t => ({
    id: t.id,
    title: t.description || t.type,
    amount: t.amount,
    type: 'TRANSACTION',
    isCredit: true, // we can guess based on amount or type, but typically wallet transactions are both. Wait, if it's a transaction, is it credit or debit? 
    // Actually getTransactions doesn't return if it's debit or credit explicitly, but the frontend needs it.
    // Let's just return the raw data and let the frontend handle it, or we can add a simple helper.
    rawType: t.type,
    date: t.date,
    status: t.status
  }));

  const formattedWd = withdrawals.items.map(w => ({
    id: w.id,
    title: 'Withdrawal to Bank',
    amount: w.amount,
    type: 'WITHDRAWAL',
    isCredit: false,
    rawType: 'WITHDRAWAL',
    date: w.createdAt,
    status: w.status
  }));

  const recentTransactions = [...formattedTx, ...formattedWd]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 15);

  return {
    balance: balanceData.balance,
    totalCredits: balanceData.totalCredits,
    totalDebits: balanceData.totalDebits,
    recentTransactions
  };
}

// ─── transfer ─────────────────────────────────────────────────────────────────

/**
 * Transfer funds from sender to recipient atomically.
 * @param {string} senderId - associateId of sender
 * @param {string} recipientUserId - userId (e.g. IW100001) of recipient
 * @param {number} amount
 * @param {string} [description]
 * @returns {{ senderTransaction, recipientTransaction }}
 */
export async function transfer(senderId, recipientUserId, amount, description = 'Fund transfer') {
  if (amount <= 0) {
    throw Object.assign(new Error('Transfer amount must be greater than 0'), { statusCode: 400 });
  }

  // Validate recipient
  const recipient = await prisma.associate.findFirst({
    where: { userId: recipientUserId, deletedAt: null },
    select: { id: true, userId: true },
  });

  if (!recipient) {
    throw Object.assign(new Error('Recipient not found'), { statusCode: 404 });
  }

  if (recipient.id === senderId) {
    throw Object.assign(new Error('Cannot transfer funds to yourself'), { statusCode: 400 });
  }

  // Check sender balance before entering transaction
  const senderWallet = await prisma.wallet.findUnique({ where: { associateId: senderId } });
  if (!senderWallet) {
    throw Object.assign(new Error('Sender wallet not found'), { statusCode: 404 });
  }
  if (Number(senderWallet.balance) < amount) {
    throw Object.assign(new Error('Insufficient wallet balance'), { statusCode: 400 });
  }

  // Get sender userId for reference
  const sender = await prisma.associate.findUnique({
    where: { id: senderId },
    select: { userId: true },
  });

  const { senderTransaction, recipientTransaction } = await prisma.$transaction(async (tx) => {
    const senderTx = await debitWallet(
      tx,
      senderId,
      amount,
      'FUND_TRANSFER_OUT',
      description,
      recipientUserId,
    );

    const recipientTx = await creditWallet(
      tx,
      recipient.id,
      amount,
      'FUND_TRANSFER_IN',
      description,
      sender.userId,
    );

    return { senderTransaction: senderTx, recipientTransaction: recipientTx };
  });

  // Fire-and-forget push notifications
  (async () => {
    try {
      const [senderTokens, recipientTokens] = await Promise.all([
        prisma.deviceToken.findMany({ where: { associateId: senderId } }),
        prisma.deviceToken.findMany({ where: { associateId: recipient.id } }),
      ]);

      const senderTokenList = senderTokens.map((t) => t.token);
      const recipientTokenList = recipientTokens.map((t) => t.token);

      await Promise.all([
        senderTokenList.length > 0
          ? sendToDevices(senderTokenList, {
              title: 'Fund Transfer Sent',
              body: `₹${amount} transferred to ${recipientUserId} successfully.`,
            }, { type: 'FUND_TRANSFER_OUT', amount: String(amount) })
          : Promise.resolve(),
        recipientTokenList.length > 0
          ? sendToDevices(recipientTokenList, {
              title: 'Fund Received',
              body: `₹${amount} received from ${sender.userId}.`,
            }, { type: 'FUND_TRANSFER_IN', amount: String(amount) })
          : Promise.resolve(),
      ]);
    } catch (err) {
      console.error('[WALLET] Push notification failed:', err.message);
    }
  })();

  return { senderTransaction, recipientTransaction };
}

// ─── getTransactions ──────────────────────────────────────────────────────────

/**
 * Return paginated wallet transactions for an associate.
 * @param {string} associateId
 * @param {{ page, pageSize, skip, take }} pagination
 */
export async function getTransactions(associateId, pagination = {}) {
  const { page = 1, pageSize = 20, skip = 0, take = 20 } = pagination;

  const wallet = await prisma.wallet.findUnique({ where: { associateId }, select: { id: true } });
  if (!wallet) {
    throw Object.assign(new Error('Wallet not found'), { statusCode: 404 });
  }

  const [records, totalItems] = await Promise.all([
    prisma.transaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      select: {
        id: true,
        createdAt: true,
        type: true,
        amount: true,
        balanceAfter: true,
        description: true,
        reference: true,
        status: true,
      },
    }),
    prisma.transaction.count({ where: { walletId: wallet.id } }),
  ]);

  const items = records.map((r) => ({
    id: r.id,
    date: r.createdAt,
    type: r.type,
    amount: Number(r.amount),
    balanceAfter: Number(r.balanceAfter),
    description: r.description,
    reference: r.reference,
    status: r.status,
  }));

  return { items, totalItems, page, pageSize };
}

// ─── getAllActivity (Unified Feed) ────────────────────────────────────────────

/**
 * Return perfectly paginated and merged transactions + withdrawals using raw SQL.
 * @param {string} associateId
 * @param {{ page, pageSize, skip, take }} pagination
 */
export async function getAllActivity(associateId, pagination = {}) {
  const { page = 1, pageSize = 20, skip = 0, take = 20 } = pagination;

  // 1. Raw SQL UNION ALL query for items
  const itemsQuery = `
    SELECT 
      t.id, 
      t.amount, 
      CAST(t.type AS TEXT) as "rawType", 
      t.description as title, 
      t."createdAt" as date, 
      CAST(t.status AS TEXT) as status,
      'TRANSACTION' as type
    FROM "Transaction" t 
    JOIN "Wallet" w ON t."walletId" = w.id 
    WHERE w."associateId" = $1

    UNION ALL

    SELECT 
      wr.id, 
      wr.amount, 
      'WITHDRAWAL' as "rawType", 
      'Withdrawal to Bank' as title, 
      wr."createdAt" as date, 
      CAST(wr.status AS TEXT) as status,
      'WITHDRAWAL' as type
    FROM "WithdrawalRequest" wr 
    WHERE wr."associateId" = $1

    ORDER BY date DESC
    LIMIT $2 OFFSET $3
  `;

  // 2. Raw SQL UNION ALL query for total count
  const countQuery = `
    SELECT SUM(cnt) as total FROM (
      SELECT COUNT(*) as cnt FROM "Transaction" t 
      JOIN "Wallet" w ON t."walletId" = w.id 
      WHERE w."associateId" = $1
      
      UNION ALL
      
      SELECT COUNT(*) as cnt FROM "WithdrawalRequest" wr 
      WHERE wr."associateId" = $1
    ) sub;
  `;

  const [rawItems, countResult] = await Promise.all([
    prisma.$queryRawUnsafe(itemsQuery, associateId, take, skip),
    prisma.$queryRawUnsafe(countQuery, associateId)
  ]);

  const totalItems = Number(countResult[0]?.total || 0);

  const items = rawItems.map((r) => ({
    id: r.id,
    title: r.title,
    amount: Number(r.amount),
    type: r.type,
    rawType: r.rawtype || r.rawType, // Postgres sometimes lowercases aliases
    date: r.date,
    status: r.status,
    isCredit: r.type === 'TRANSACTION' 
      ? (String(r.rawtype || r.rawType).includes('IN') || String(r.rawtype || r.rawType).includes('CREDIT') || String(r.rawtype || r.rawType).includes('BONUS') || String(r.rawtype || r.rawType).includes('INCOME'))
      : false // Withdrawals are always debit
  }));

  return { items, totalItems, page, pageSize };
}

// ─── requestWithdrawal ────────────────────────────────────────────────────────

/**
 * Create a withdrawal request for an associate.
 * @param {string} associateId
 * @param {number} amount
 * @returns {Promise<object>} Created WithdrawalRequest
 */
export async function requestWithdrawal(associateId, amount) {
  if (amount <= 0) {
    throw Object.assign(new Error('Withdrawal amount must be greater than 0'), { statusCode: 400 });
  }

  const wallet = await prisma.wallet.findUnique({ where: { associateId } });
  if (!wallet) {
    throw Object.assign(new Error('Wallet not found'), { statusCode: 404 });
  }

  if (Number(wallet.balance) < amount) {
    throw Object.assign(new Error('Insufficient wallet balance'), { statusCode: 400 });
  }

  const request = await prisma.withdrawalRequest.create({
    data: {
      associateId,
      amount,
      status: 'PENDING',
    },
  });

  return request;
}

// ─── getWithdrawals ───────────────────────────────────────────────────────────

/**
 * Return paginated withdrawal requests for an associate.
 * @param {string} associateId
 * @param {{ page, pageSize, skip, take }} pagination
 */
export async function getWithdrawals(associateId, pagination = {}) {
  const { page = 1, pageSize = 20, skip = 0, take = 20 } = pagination;

  const [records, totalItems] = await Promise.all([
    prisma.withdrawalRequest.findMany({
      where: { associateId },
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
      },
    }),
    prisma.withdrawalRequest.count({ where: { associateId } }),
  ]);

  const items = records.map((r) => ({
    id: r.id,
    amount: Number(r.amount),
    status: r.status,
    transactionRef: r.transactionRef,
    createdAt: r.createdAt,
    processedAt: r.processedAt,
  }));

  return { items, totalItems, page, pageSize };
}
