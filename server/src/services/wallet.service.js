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
  const wallet = await tx.wallet.update({
    where: { associateId },
    data: {
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
