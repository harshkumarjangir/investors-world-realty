import prisma from '../../utils/prisma.js';
import { getRedisClient, TTL } from '../../utils/redis.js';

const CACHE_KEY = 'cache:dashboard:admin';

// ─── getAdminDashboard ────────────────────────────────────────────────────────

/**
 * Return aggregate stats for the admin dashboard.
 * Cached in Redis for 60 seconds.
 */
export async function getAdminDashboard() {
  const redis = getRedisClient();

  // Try cache first
  try {
    const cached = await redis.get(CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch {
    // Redis unavailable — proceed without cache
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const [
    totalAssociates,
    activeAssociates,
    inactiveAssociates,
    redAssociates,
    suspendedAssociates,
    todayRegistrations,
    pendingWithdrawals,
    totalPayoutDisbursed,
  ] = await Promise.all([
    prisma.associate.count({ where: { deletedAt: null } }),
    prisma.associate.count({ where: { deletedAt: null, status: 'ACTIVE' } }),
    prisma.associate.count({ where: { deletedAt: null, status: 'INACTIVE' } }),
    prisma.associate.count({ where: { deletedAt: null, status: 'RED' } }),
    prisma.associate.count({ where: { deletedAt: null, status: 'SUSPENDED' } }),
    prisma.associate.count({
      where: {
        deletedAt: null,
        createdAt: { gte: today },
      },
    }),

    // Sum of PENDING withdrawal amounts
    prisma.withdrawalRequest.aggregate({
      where: { status: 'PENDING' },
      _sum: { amount: true },
    }),
    // Sum of PAID payout totalAmounts
    prisma.payout.aggregate({
      where: { status: 'PAID' },
      _sum: { totalAmount: true },
    }),
  ]);

  const totalBusinessVolume = 0;

  // ─── Weekly comparison for percentage changes ──────────────────────────────
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const [thisWeekRegistrations, lastWeekRegistrations, thisWeekPayouts, lastWeekPayouts] = await Promise.all([
    prisma.associate.count({ where: { deletedAt: null, createdAt: { gte: oneWeekAgo } } }),
    prisma.associate.count({ where: { deletedAt: null, createdAt: { gte: twoWeeksAgo, lt: oneWeekAgo } } }),
    prisma.payout.aggregate({ where: { status: 'PAID', createdAt: { gte: oneWeekAgo } }, _sum: { totalAmount: true } }),
    prisma.payout.aggregate({ where: { status: 'PAID', createdAt: { gte: twoWeeksAgo, lt: oneWeekAgo } }, _sum: { totalAmount: true } }),
  ]);

  function calcChange(current, previous) {
    if (!previous || previous === 0) return current > 0 ? '+100%' : '0%';
    const pct = Math.round(((current - previous) / previous) * 100);
    return pct >= 0 ? `+${pct}%` : `${pct}%`;
  }

  // ─── Daily registration data for the past 7 days ──────────────────────────
  const weeklyData = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date();
    dayStart.setDate(dayStart.getDate() - i);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const [regCount, dayIncome] = await Promise.all([
      prisma.associate.count({ where: { deletedAt: null, createdAt: { gte: dayStart, lte: dayEnd } } }),
      prisma.incomeRecord.aggregate({ where: { createdAt: { gte: dayStart, lte: dayEnd } }, _sum: { amount: true } }),
    ]);

    weeklyData.push({
      day: dayNames[dayStart.getDay()],
      date: dayStart.toISOString().slice(0, 10),
      registrations: regCount,
      income: Number(dayIncome._sum.amount || 0),
    });
  }

  const result = {
    totalAssociates,
    activeAssociates,
    inactiveAssociates,
    redAssociates,
    suspendedAssociates,
    todayRegistrations,
    totalBusinessVolume,
    pendingWithdrawals: Number(pendingWithdrawals._sum.amount || 0),
    totalPayoutDisbursed: Number(totalPayoutDisbursed._sum.totalAmount || 0),
    // Weekly changes
    changes: {
      registrations: calcChange(thisWeekRegistrations, lastWeekRegistrations),
      payouts: calcChange(Number(thisWeekPayouts._sum.totalAmount || 0), Number(lastWeekPayouts._sum.totalAmount || 0)),
      thisWeekRegistrations,
    },
    // Daily chart data
    weeklyData,
  };

  // Cache result
  try {
    await redis.set(CACHE_KEY, JSON.stringify(result), 'EX', TTL.DASHBOARD);
  } catch {
    // Ignore cache write failures
  }

  return result;
}

// ─── getRecentTransactions ────────────────────────────────────────────────────

/**
 * Return the 20 most recent transactions across all wallets.
 * Cached in Redis for 60 seconds.
 */
export async function getRecentTransactions() {
  const redis = getRedisClient();
  const cacheKey = `${CACHE_KEY}:recent-transactions`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch {
    // Redis unavailable — proceed without cache
  }

  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      createdAt: true,
      type: true,
      amount: true,
      status: true,
      wallet: {
        select: {
          associate: {
            select: { userId: true, name: true },
          },
        },
      },
    },
  });

  const items = transactions.map((t) => ({
    id: t.id,
    date: t.createdAt,
    type: t.type,
    amount: Number(t.amount),
    status: t.status,
    associateUserId: t.wallet.associate.userId,
    associateName: t.wallet.associate.name,
  }));

  try {
    await redis.set(cacheKey, JSON.stringify(items), 'EX', TTL.DASHBOARD);
  } catch {
    // Ignore cache write failures
  }

  return items;
}
