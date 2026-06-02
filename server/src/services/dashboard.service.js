import QRCode from 'qrcode';
import prisma from '../utils/prisma.js';
import config from '../config/index.js';

const RANK_NAMES = [
  '', 'Business Associate', 'Business Adviser', 'Business Head',
  'Dist. Business Head', 'State Business Head', 'Regional Business Head',
  'National Business Head', 'Vice President Sales', 'President Sales', 'President Club',
];

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getDashboard(associateId) {
  const associate = await prisma.associate.findUnique({
    where: { id: associateId },
    include: {
      package: { select: { name: true } },
      wallet: {
        include: {
          transactions: {
            where: { status: 'COMPLETED' },
            orderBy: { createdAt: 'desc' },
          },
        },
      },
      treeNode: { select: { position: true, level: true } },
      sponsored: {
        where: { status: 'ACTIVE', deletedAt: null },
        select: { id: true },
      },
    },
  });

  if (!associate) {
    throw Object.assign(new Error('Associate not found'), { statusCode: 404 });
  }

  const transactions = associate.wallet?.transactions ?? [];

  // Last completed transaction amount
  const lastPayment = transactions.length > 0 ? Number(transactions[0].amount) : 0;

  // Sum of all income-type credits
  const incomeTypes = ['DIRECT_INCOME', 'LEVEL_INCOME', 'MATCHING_INCOME', 'REWARD_INCOME'];
  const totalPayment = transactions
    .filter((t) => incomeTypes.includes(t.type))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Self invested (property commissions earned personally)
  const selfAmount = transactions
    .filter((t) => t.type === 'DIRECT_INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Total network amount — sum of all credits across wallet
  const totalAmount = transactions
    .filter((t) => Number(t.amount) > 0)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Advance payment status from AdvancePayment ledger
  const advanceAgg = await prisma.advancePayment.groupBy({
    by: ['type'],
    where: { associateId },
    _sum: { amount: true },
  });
  const advCredit = Number(advanceAgg.find((a) => a.type === 'CREDIT')?._sum?.amount ?? 0);
  const advDebit  = Number(advanceAgg.find((a) => a.type === 'DEBIT')?._sum?.amount ?? 0);
  const advBalance = advCredit - advDebit;

  // Masked PAN
  const maskedPan = associate.panNumber
    ? `XXXXX${associate.panNumber.slice(-4)}`
    : null;

  // Total active downlines (direct only)
  const totalActivations = associate.sponsored.length;

  // Referral link
  const referralLink = `${config.APP_BASE_URL}/register?ref=${associate.userId}`;

  return {
    // ── Top Cards ──────────────────────────────────────
    cards: {
      lastPayment,
      totalPayment,
      selfAmount,
      totalAmount,
    },
    // ── User Details ───────────────────────────────────
    userDetails: {
      userId: associate.userId,
      name: associate.name,
      joiningDate: associate.joiningDate,
      activationDate: associate.activationDate,
      panNumber: maskedPan,
      totalActivations,
      rank: associate.rank,
      rankName: RANK_NAMES[associate.rank] || 'Unknown',
      totalAreaSold: associate.totalAreaSold,
      profilePhoto: associate.profilePhoto || null,
      status: associate.status,
    },
    // ── Advance Payment Status ─────────────────────────
    advancePayment: {
      credit: advCredit,
      debit: advDebit,
      balance: advBalance,
    },
    // ── Referral ───────────────────────────────────────
    referral: {
      referralLink,
      userId: associate.userId,
    },
  };
}

// ─── Advance Payment (separate endpoint) ──────────────────────────────────────

export async function getAdvancePayment(associateId) {
  const advanceAgg = await prisma.advancePayment.groupBy({
    by: ['type'],
    where: { associateId },
    _sum: { amount: true },
  });

  const credit  = Number(advanceAgg.find((a) => a.type === 'CREDIT')?._sum?.amount ?? 0);
  const debit   = Number(advanceAgg.find((a) => a.type === 'DEBIT')?._sum?.amount ?? 0);
  const balance = credit - debit;

  return { credit, debit, balance };
}

// ─── Referral Link ────────────────────────────────────────────────────────────

export async function getReferralLink(associateId) {
  const associate = await prisma.associate.findUnique({
    where: { id: associateId },
    select: { userId: true },
  });

  if (!associate) {
    throw Object.assign(new Error('Associate not found'), { statusCode: 404 });
  }

  const referralLink = `${config.APP_BASE_URL}/register?ref=${associate.userId}`;
  return { referralLink, userId: associate.userId };
}

// ─── Referral QR ─────────────────────────────────────────────────────────────

export async function getReferralQR(associateId) {
  const { referralLink } = await getReferralLink(associateId);
  const qrCode = await QRCode.toDataURL(referralLink);
  return { qrCode, referralLink };
}
