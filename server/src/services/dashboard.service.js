import QRCode from 'qrcode';
import prisma from '../utils/prisma.js';
import config from '../config/index.js';

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

  // Sum of income-type credits
  const incomeTypes = ['DIRECT_INCOME', 'LEVEL_INCOME', 'MATCHING_INCOME', 'REWARD_INCOME'];
  const totalPayments = transactions
    .filter((t) => incomeTypes.includes(t.type))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Sum of package purchase transactions
  const selfInvested = transactions
    .filter((t) => t.type === 'PACKAGE_PURCHASE')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Total network amount: sum of package prices of all active downline associates
  const downlineNodes = await getDownlineAssociateIds(associateId);
  let totalNetworkAmount = 0;
  if (downlineNodes.length > 0) {
    const downlineAssociates = await prisma.associate.findMany({
      where: {
        id: { in: downlineNodes },
        status: 'ACTIVE',
        deletedAt: null,
      },
      include: { package: { select: { price: true } } },
    });
    totalNetworkAmount = downlineAssociates.reduce(
      (sum, a) => sum + (a.package ? Number(a.package.price) : 0),
      0,
    );
  }

  // Masked PAN
  const maskedPan = associate.panNumber
    ? `XXXXX${associate.panNumber.slice(-4)}`
    : null;

  return {
    lastPayment,
    totalPayments,
    selfInvested,
    totalNetworkAmount,
    joiningDate: associate.joiningDate,
    activationDate: associate.activationDate,
    packageName: associate.package?.name ?? null,
    maskedPan,
    totalActivations: associate.sponsored.length,
  };
}

// Helper: collect all descendant associate IDs via BFS on TreeNode
async function getDownlineAssociateIds(associateId) {
  const rootNode = await prisma.treeNode.findUnique({
    where: { associateId },
    select: { id: true },
  });
  if (!rootNode) return [];

  const visited = new Set();
  const queue = [rootNode.id];

  while (queue.length > 0) {
    const batch = queue.splice(0, queue.length);
    const children = await prisma.treeNode.findMany({
      where: { parentId: { in: batch } },
      select: { id: true, associateId: true },
    });
    for (const child of children) {
      if (!visited.has(child.id)) {
        visited.add(child.id);
        queue.push(child.id);
      }
    }
  }

  // Fetch associateIds for all visited nodes
  if (visited.size === 0) return [];
  const nodes = await prisma.treeNode.findMany({
    where: { id: { in: [...visited] } },
    select: { associateId: true },
  });
  return nodes.map((n) => n.associateId);
}

// ─── Advance Payment ──────────────────────────────────────────────────────────
export async function getAdvancePayment(associateId) {
  const wallet = await prisma.wallet.findUnique({
    where: { associateId },
    select: {
      totalCredits: true,
      totalDebits: true,
      balance: true,
    },
  });

  if (!wallet) {
    throw Object.assign(new Error('Wallet not found'), { statusCode: 404 });
  }

  return {
    creditAmount: Number(wallet.totalCredits),
    debitAmount: Number(wallet.totalDebits),
    balance: Number(wallet.balance),
  };
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
  return { referralLink };
}

// ─── Referral QR ──────────────────────────────────────────────────────────────
export async function getReferralQR(associateId) {
  const { referralLink } = await getReferralLink(associateId);
  const qrCode = await QRCode.toDataURL(referralLink);
  return { qrCode };
}
