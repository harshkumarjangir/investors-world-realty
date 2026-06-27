import QRCode from 'qrcode';
import prisma from '../utils/prisma.js';
import config from '../config/index.js';

const RANK_NAMES = [
  '', 'Business Associate', 'Business Adviser', 'Business Head',
  'Dist. Business Head', 'State Business Head', 'Regional Business Head',
  'National Business Head', 'Vice President Sales', 'President Sales', 'President Club',
];

// ─── getDashboard ─────────────────────────────────────────────────────────────
// Single endpoint that returns ALL dashboard data:
// cards, userDetails, advancePayment, referral link + QR code
// Replaces 4 separate endpoints: /dashboard, /advance-payment, /referral-link, /referral-qr

export async function getDashboard(associateId) {
  // Fetch associate + wallet + sponsored count in parallel
  const [associate, sponsoredCount] = await Promise.all([
    prisma.associate.findUnique({
      where: { id: associateId },
      include: {
        wallet: {
          include: {
            transactions: {
              where: { status: 'COMPLETED' },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        treeNode: { select: { position: true, level: true } },
      },
    }),
    prisma.associate.count({
      where: { sponsorId: associateId, status: 'ACTIVE', deletedAt: null },
    }),
  ]);

  if (!associate) {
    throw Object.assign(new Error('Associate not found'), { statusCode: 404 });
  }

  const transactions = associate.wallet?.transactions ?? [];

  // ── Cards ──────────────────────────────────────────────────────────────────
  const incomeTypes = ['DIRECT_INCOME', 'LEVEL_INCOME', 'MATCHING_INCOME', 'REWARD_INCOME'];
  const lastPayment  = transactions.length > 0 ? Number(Number(transactions[0].amount).toFixed(2)) : 0;
  const totalPayment = Number(transactions.filter((t) => incomeTypes.includes(t.type)).reduce((s, t) => s + Number(t.amount), 0).toFixed(2));
  const selfAmount   = Number(transactions.filter((t) => t.type === 'DIRECT_INCOME').reduce((s, t) => s + Number(t.amount), 0).toFixed(2));
  
  // Use actual wallet balance instead of just summing positive transactions
  const walletBalance = Number(associate.wallet?.balance ?? 0);
  const totalAmount = walletBalance;

  // ── Advance Payment (safe — model may not exist on older deployments) ──────
  let advCredit = 0, advDebit = 0;
  try {
    if (prisma.advancePayment) {
      const advanceAgg = await prisma.advancePayment.groupBy({
        by: ['type'],
        where: { associateId },
        _sum: { amount: true },
      });
      advCredit = Number(advanceAgg.find((a) => a.type === 'CREDIT')?._sum?.amount ?? 0);
      advDebit  = Number(advanceAgg.find((a) => a.type === 'DEBIT')?._sum?.amount ?? 0);
    }
  } catch {
    // AdvancePayment table not yet migrated — return zeros
  }

  // ── Referral ───────────────────────────────────────────────────────────────
  const referralLink = `${config.APP_BASE_URL}/register?ref=${associate.userId}`;
  let qrCode = null;
  try {
    qrCode = await QRCode.toDataURL(referralLink);
  } catch {
    // QR generation failed — not critical
  }

  // ── Masked PAN ─────────────────────────────────────────────────────────────
  const maskedPan = associate.panNumber ? `XXXXX${associate.panNumber.slice(-4)}` : null;

  return {
    cards: {
      lastPayment,
      totalPayment,
      selfAmount,
      totalAmount,
      walletBalance,
    },
    userDetails: {
      userId:          associate.userId,
      name:            associate.name,
      joiningDate:     associate.joiningDate,
      activationDate:  associate.activationDate,
      panNumber:       maskedPan,
      totalActivations: sponsoredCount,
      rank:            associate.rank,
      rankName:        RANK_NAMES[associate.rank] || 'Unknown',
      totalAreaSold:   associate.totalAreaSold,
      profilePhoto:    associate.profilePhoto || null,
      status:          associate.status,
    },
    advancePayment: {
      credit:  advCredit,
      debit:   advDebit,
      balance: advCredit - advDebit,
    },
    referral: {
      referralLink,
      userId: associate.userId,
      qrCode,           // base64 PNG — display with Image.memory(base64Decode(qrCode.split(',')[1]))
    },
  };
}

// ─── Kept for backward compat — delegate to getDashboard ─────────────────────

export async function getAdvancePayment(associateId) {
  const dash = await getDashboard(associateId);
  return dash.advancePayment;
}

export async function getReferralLink(associateId) {
  const associate = await prisma.associate.findUnique({
    where: { id: associateId },
    select: { userId: true },
  });
  if (!associate) throw Object.assign(new Error('Associate not found'), { statusCode: 404 });
  const referralLink = `${config.APP_BASE_URL}/register?ref=${associate.userId}`;
  return { referralLink, userId: associate.userId };
}

export async function getReferralQR(associateId) {
  const { referralLink } = await getReferralLink(associateId);
  const qrCode = await QRCode.toDataURL(referralLink);
  return { qrCode, referralLink };
}
