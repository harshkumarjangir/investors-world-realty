import prisma from '../../utils/prisma.js';
import { creditWallet } from '../wallet.service.js';
import { logAdminAction } from '../../middleware/auditLog.js';
import { sendNotificationToAssociate } from '../notification.service.js';

// ─── generatePayouts ──────────────────────────────────────────────────────────

/**
 * Find all ACTIVE associates with PENDING IncomeRecords.
 * Group by associate, create a Payout per associate, link IncomeRecords.
 * @param {string} adminId
 * @returns {{ count: number }}
 */
export async function generatePayouts(adminId) {
  // Find all PENDING income records for ACTIVE associates
  const pendingRecords = await prisma.incomeRecord.findMany({
    where: {
      status: 'PENDING',
      payoutId: null,
      associate: { status: 'ACTIVE', deletedAt: null },
    },
    select: {
      id: true,
      associateId: true,
      amount: true,
    },
  });

  if (pendingRecords.length === 0) {
    return { count: 0 };
  }

  // Group by associateId
  const grouped = new Map();
  for (const record of pendingRecords) {
    if (!grouped.has(record.associateId)) {
      grouped.set(record.associateId, []);
    }
    grouped.get(record.associateId).push(record);
  }

  let count = 0;

  // Create a Payout per associate inside a transaction
  for (const [associateId, records] of grouped) {
    const totalAmount = records.reduce((sum, r) => sum + Number(r.amount), 0);
    const recordIds = records.map((r) => r.id);

    await prisma.$transaction(async (tx) => {
      const payout = await tx.payout.create({
        data: {
          totalAmount,
          status: 'PENDING',
        },
      });

      await tx.incomeRecord.updateMany({
        where: { id: { in: recordIds } },
        data: { payoutId: payout.id },
      });
    });

    count += 1;
  }

  await logAdminAction(
    adminId,
    'GENERATE_PAYOUTS',
    'Payout',
    null,
    { payoutsCreated: count },
  );

  return { count };
}

// ─── getPendingPayouts ────────────────────────────────────────────────────────

/**
 * Return paginated PENDING payouts with associate info and income breakdown.
 * @param {{ page, pageSize, skip, take }} pagination
 */
export async function getPendingPayouts(pagination = {}) {
  const { page = 1, pageSize = 20, skip = 0, take = 20 } = pagination;

  const [records, totalItems] = await Promise.all([
    prisma.payout.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        incomeRecords: {
          select: {
            id: true,
            type: true,
            amount: true,
            associateId: true,
            associate: { select: { userId: true, name: true } },
          },
        },
      },
    }),
    prisma.payout.count({ where: { status: 'PENDING' } }),
  ]);

  const items = records.map((payout) => {
    // All income records in a payout belong to the same associate
    const firstRecord = payout.incomeRecords[0];
    const associate = firstRecord?.associate || null;

    // Income breakdown by type
    const incomeBreakdown = {};
    for (const record of payout.incomeRecords) {
      if (!incomeBreakdown[record.type]) {
        incomeBreakdown[record.type] = 0;
      }
      incomeBreakdown[record.type] += Number(record.amount);
    }

    return {
      id: payout.id,
      totalAmount: Number(payout.totalAmount),
      status: payout.status,
      createdAt: payout.createdAt,
      associate: associate
        ? { userId: associate.userId, name: associate.name }
        : null,
      incomeBreakdown,
    };
  });

  return { items, totalItems, page, pageSize };
}

// ─── approvePayout ────────────────────────────────────────────────────────────

/**
 * Approve a payout: update status, credit wallet, update income records.
 * @param {string} payoutId
 * @param {string} adminId
 */
export async function approvePayout(payoutId, adminId) {
  const payout = await prisma.payout.findUnique({
    where: { id: payoutId },
    include: {
      incomeRecords: {
        select: { id: true, associateId: true, amount: true },
      },
    },
  });

  if (!payout) {
    throw Object.assign(new Error('Payout not found'), { statusCode: 404 });
  }

  if (payout.status !== 'PENDING') {
    throw Object.assign(new Error('Payout is not in PENDING status'), { statusCode: 400 });
  }

  const associateId = payout.incomeRecords[0]?.associateId;
  if (!associateId) {
    throw Object.assign(new Error('No income records linked to this payout'), { statusCode: 400 });
  }

  const incomeRecordIds = payout.incomeRecords.map((r) => r.id);

  await prisma.$transaction(async (tx) => {
    // Update payout status
    await tx.payout.update({
      where: { id: payoutId },
      data: { status: 'APPROVED', approvedBy: adminId },
    });

    // Credit associate wallet
    await creditWallet(
      tx,
      associateId,
      Number(payout.totalAmount),
      'DIRECT_INCOME',
      `Payout approved: ${payoutId}`,
      payoutId,
      adminId,
    );

    // Update income records to APPROVED
    await tx.incomeRecord.updateMany({
      where: { id: { in: incomeRecordIds } },
      data: { status: 'APPROVED' },
    });
  });

  // Send push notification (fire-and-forget)
  (async () => {
    try {
      await sendNotificationToAssociate(
        associateId,
        'Payout Approved',
        `Your payout of ₹${Number(payout.totalAmount)} has been approved.`,
        'PAYOUT',
        { payoutId },
      );
    } catch (err) {
      console.error('[PAYOUT] Notification failed:', err.message);
    }
  })();

  await logAdminAction(
    adminId,
    'APPROVE_PAYOUT',
    'Payout',
    payoutId,
    { totalAmount: Number(payout.totalAmount), associateId },
  );

  return { success: true, payoutId };
}

// ─── rejectPayout ─────────────────────────────────────────────────────────────

/**
 * Reject a payout: update status, set reason, update income records.
 * @param {string} payoutId
 * @param {string} reason
 * @param {string} adminId
 */
export async function rejectPayout(payoutId, reason, adminId) {
  const payout = await prisma.payout.findUnique({
    where: { id: payoutId },
    include: {
      incomeRecords: {
        select: { id: true, associateId: true },
      },
    },
  });

  if (!payout) {
    throw Object.assign(new Error('Payout not found'), { statusCode: 404 });
  }

  if (payout.status !== 'PENDING') {
    throw Object.assign(new Error('Payout is not in PENDING status'), { statusCode: 400 });
  }

  const associateId = payout.incomeRecords[0]?.associateId;
  const incomeRecordIds = payout.incomeRecords.map((r) => r.id);

  await prisma.$transaction([
    prisma.payout.update({
      where: { id: payoutId },
      data: { status: 'REJECTED', rejectedReason: reason || null },
    }),
    prisma.incomeRecord.updateMany({
      where: { id: { in: incomeRecordIds } },
      data: { status: 'REJECTED' },
    }),
  ]);

  // Send push notification (fire-and-forget)
  if (associateId) {
    (async () => {
      try {
        await sendNotificationToAssociate(
          associateId,
          'Payout Rejected',
          `Your payout of ₹${Number(payout.totalAmount)} has been rejected. Reason: ${reason || 'N/A'}`,
          'PAYOUT',
          { payoutId },
        );
      } catch (err) {
        console.error('[PAYOUT] Notification failed:', err.message);
      }
    })();
  }

  await logAdminAction(
    adminId,
    'REJECT_PAYOUT',
    'Payout',
    payoutId,
    { reason, associateId },
  );

  return { success: true, payoutId };
}

// ─── getPayoutReports ─────────────────────────────────────────────────────────

/**
 * Return paginated IncomeRecords matching filters.
 * @param {{ startDate?, endDate?, type?, associateId? }} filters
 * @param {{ page, pageSize, skip, take }} pagination
 */
export async function getPayoutReports(filters = {}, pagination = {}) {
  const { startDate, endDate, type, associateId } = filters;
  const { page = 1, pageSize = 20, skip = 0, take = 20 } = pagination;

  const where = {};

  if (startDate) {
    where.createdAt = { ...where.createdAt, gte: new Date(startDate) };
  }
  if (endDate) {
    where.createdAt = { ...where.createdAt, lte: new Date(endDate) };
  }
  if (type) {
    where.type = type;
  }
  if (associateId) {
    where.associateId = associateId;
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
        payoutId: true,
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
    payoutId: r.payoutId,
    associateUserId: r.associate.userId,
    associateName: r.associate.name,
  }));

  return { items, totalItems, page, pageSize };
}
