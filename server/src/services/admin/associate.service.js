import prisma from '../../utils/prisma.js';
import { logAdminAction } from '../../middleware/auditLog.js';
import { registerAssociate, activateAssociate } from '../registration.service.js';

const RANK_NAMES = [
  '', 'Business Associate', 'Business Adviser', 'Business Head',
  'Dist. Business Head', 'State Business Head', 'Regional Business Head',
  'National Business Head', 'Vice President Sales', 'President Sales', 'President Club',
];

// ─── adminListAssociates ───────────────────────────────────────────────────────

export async function adminListAssociates(filters = {}, pagination = {}) {
  const {
    status, search, city, state, phone, panNumber, sponsorUserId,
    dobFrom, dobTo, rank,
    fromDate, toDate,           // joining date range
    approveFrom, approveTo,     // activation date range
  } = filters;
  const { page = 1, pageSize = 20, skip = 0, take = 20 } = pagination;

  const where = { deletedAt: null };

  if (status)     where.status = status;
  if (rank)       where.rank = parseInt(rank, 10);
  if (city)       where.city       = { contains: city, mode: 'insensitive' };
  if (state)      where.state      = { contains: state, mode: 'insensitive' };
  if (phone)      where.phone      = { contains: phone, mode: 'insensitive' };
  if (panNumber)  where.panNumber  = { contains: panNumber, mode: 'insensitive' };

  if (search) {
    where.OR = [
      { name:   { contains: search, mode: 'insensitive' } },
      { userId: { contains: search, mode: 'insensitive' } },
      { email:  { contains: search, mode: 'insensitive' } },
      { phone:  { contains: search, mode: 'insensitive' } },
    ];
  }

  if (sponsorUserId) {
    const sponsor = await prisma.associate.findFirst({
      where: { userId: sponsorUserId, deletedAt: null }, select: { id: true },
    });
    if (sponsor) where.sponsorId = sponsor.id;
    else return { items: [], totalItems: 0, page, pageSize };
  }

  if (fromDate || toDate) {
    where.joiningDate = {};
    if (fromDate) where.joiningDate.gte = new Date(fromDate);
    if (toDate)   where.joiningDate.lte = new Date(toDate);
  }

  if (approveFrom || approveTo) {
    where.activationDate = {};
    if (approveFrom) where.activationDate.gte = new Date(approveFrom);
    if (approveTo)   where.activationDate.lte = new Date(approveTo);
  }

  if (dobFrom || dobTo) {
    where.dateOfBirth = {};
    if (dobFrom) where.dateOfBirth.gte = new Date(dobFrom);
    if (dobTo)   where.dateOfBirth.lte = new Date(dobTo);
  }

  const [records, totalItems] = await Promise.all([
    prisma.associate.findMany({
      where,
      orderBy: { joiningDate: 'desc' },
      skip,
      take,
      select: {
        id: true,
        userId: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        state: true,
        panNumber: true,
        status: true,
        rank: true,
        totalAreaSold: true,
        joiningDate: true,
        activationDate: true,
        sponsor: { select: { userId: true, name: true } },
      },
    }),
    prisma.associate.count({ where }),
  ]);

  const items = records.map((a) => ({
    id: a.id,
    userId: a.userId,
    name: a.name,
    email: a.email,
    phone: a.phone,
    city: a.city,
    state: a.state,
    panNumber: a.panNumber,
    status: a.status,
    rank: a.rank,
    rankName: RANK_NAMES[a.rank] || 'Unknown',
    totalAreaSold: a.totalAreaSold,
    joiningDate: a.joiningDate,
    activationDate: a.activationDate,
    sponsorUserId: a.sponsor?.userId || null,
    sponsorName: a.sponsor?.name || null,
  }));

  return { items, totalItems, page, pageSize };
}

// ─── adminGetAssociate ─────────────────────────────────────────────────────────

export async function adminGetAssociate(associateId) {
  const associate = await prisma.associate.findUnique({
    where: { id: associateId },
    include: {
      kycDocuments: {
        select: { type: true, status: true, documentNumber: true, documentUrl: true, documentUrlBack: true, createdAt: true },
      },
      wallet: {
        select: { balance: true, totalCredits: true, totalDebits: true },
      },
      treeNode: {
        select: { level: true, position: true, leftVolume: true, rightVolume: true, carryForward: true },
      },
      sponsor: { select: { userId: true, name: true, phone: true } },
    },
  });

  if (!associate) {
    throw Object.assign(new Error('Associate not found'), { statusCode: 404 });
  }

  const incomeSummary = await prisma.incomeRecord.groupBy({
    by: ['type'],
    where: { associateId },
    _sum: { amount: true },
  });

  const incomeByType = {};
  for (const row of incomeSummary) {
    incomeByType[row.type] = Number(row._sum.amount || 0);
  }

  const treeNode = associate.treeNode;
  let leftCount = 0, rightCount = 0;

  if (treeNode) {
    const countSubtree = async (nodeId) => {
      if (!nodeId) return 0;
      const node = await prisma.treeNode.findUnique({ where: { id: nodeId } });
      if (!node) return 0;
      return 1 + await countSubtree(node.leftChildId) + await countSubtree(node.rightChildId);
    };
    [leftCount, rightCount] = await Promise.all([
      countSubtree(treeNode.leftChildId ?? null),
      countSubtree(treeNode.rightChildId ?? null),
    ]);
  }

  return {
    id: associate.id,
    userId: associate.userId,
    name: associate.name,
    email: associate.email,
    phone: associate.phone,
    dateOfBirth: associate.dateOfBirth,
    address: associate.address,
    city: associate.city,
    state: associate.state,
    pincode: associate.pincode,
    panNumber: associate.panNumber,
    profilePhoto: associate.profilePhoto,
    status: associate.status,
    rank: associate.rank,
    rankName: RANK_NAMES[associate.rank] || 'Unknown',
    totalAreaSold: associate.totalAreaSold,
    joiningDate: associate.joiningDate,
    activationDate: associate.activationDate,
    sponsor: associate.sponsor || null,
    kyc: associate.kycDocuments,
    wallet: associate.wallet
      ? {
          balance: Number(associate.wallet.balance),
          totalCredits: Number(associate.wallet.totalCredits),
          totalDebits: Number(associate.wallet.totalDebits),
        }
      : null,
    incomeSummary: incomeByType,
    teamStats: {
      leftCount,
      rightCount,
      leftVolume:  treeNode ? Number(treeNode.leftVolume)  : 0,
      rightVolume: treeNode ? Number(treeNode.rightVolume) : 0,
      level:    treeNode?.level    ?? null,
      position: treeNode?.position ?? null,
    },
  };
}

// ─── adminRegisterAssociate ────────────────────────────────────────────────────

export async function adminRegisterAssociate(data, adminId) {
  const associate = await registerAssociate(data);
  await logAdminAction(adminId, 'REGISTER_ASSOCIATE', 'Associate', associate.id, { userId: associate.userId });
  return associate;
}

// ─── adminEditAssociate ────────────────────────────────────────────────────────

export async function adminEditAssociate(associateId, data, adminId) {
  const existing = await prisma.associate.findUnique({ where: { id: associateId, deletedAt: null } });
  if (!existing) throw Object.assign(new Error('Associate not found'), { statusCode: 404 });

  const { name, email, phone, address, city, state, pincode, status, password, rank } = data;

  let hashedPassword;
  if (password) {
    const bcrypt = await import('bcryptjs');
    hashedPassword = await bcrypt.hash(password, 12);
  }

  // Validate rank if provided
  if (rank !== undefined) {
    const rankNum = parseInt(rank, 10);
    if (isNaN(rankNum) || rankNum < 1 || rankNum > 10) {
      throw Object.assign(new Error('Rank must be between 1 and 10'), { statusCode: 400 });
    }
  }

  const updated = await prisma.associate.update({
    where: { id: associateId },
    data: {
      ...(name      !== undefined && { name }),
      ...(email     !== undefined && { email }),
      ...(phone     !== undefined && { phone }),
      ...(address   !== undefined && { address }),
      ...(city      !== undefined && { city }),
      ...(state     !== undefined && { state }),
      ...(pincode   !== undefined && { pincode }),
      ...(status    !== undefined && { status }),
      ...(rank      !== undefined && { rank: parseInt(rank, 10) }),
      ...(hashedPassword && { password: hashedPassword, failedAttempts: 0 }),
    },
    select: { id: true, userId: true, name: true, email: true, phone: true, status: true, rank: true },
  });

  await logAdminAction(adminId, 'EDIT_ASSOCIATE', 'Associate', associateId, { changes: data });
  return updated;
}

// ─── adminActivateAssociate ────────────────────────────────────────────────────

export async function adminActivateAssociate(associateId, packageId, adminId) {
  const associate = await activateAssociate(associateId, packageId);
  await logAdminAction(adminId, 'ACTIVATE_ASSOCIATE', 'Associate', associateId, { packageId });
  return associate;
}

// ─── adminSuspendAssociate ─────────────────────────────────────────────────────

export async function adminSuspendAssociate(associateId, adminId) {
  const existing = await prisma.associate.findUnique({ where: { id: associateId, deletedAt: null } });
  if (!existing) throw Object.assign(new Error('Associate not found'), { statusCode: 404 });

  const updated = await prisma.associate.update({
    where: { id: associateId },
    data: { status: 'SUSPENDED' },
    select: { id: true, userId: true, name: true, status: true },
  });

  await logAdminAction(adminId, 'SUSPEND_ASSOCIATE', 'Associate', associateId, { previousStatus: existing.status });
  return updated;
}

// ─── adminUnsuspendAssociate ───────────────────────────────────────────────────
// Re-activates a SUSPENDED associate back to ACTIVE

export async function adminUnsuspendAssociate(associateId, adminId) {
  const existing = await prisma.associate.findUnique({ where: { id: associateId, deletedAt: null } });
  if (!existing) throw Object.assign(new Error('Associate not found'), { statusCode: 404 });

  if (existing.status !== 'SUSPENDED') {
    throw Object.assign(new Error('Associate is not suspended'), { statusCode: 400 });
  }

  const updated = await prisma.associate.update({
    where: { id: associateId },
    data: { status: 'ACTIVE' },
    select: { id: true, userId: true, name: true, status: true },
  });

  await logAdminAction(adminId, 'UNSUSPEND_ASSOCIATE', 'Associate', associateId, {});
  return updated;
}

// ─── adminDeleteAssociate ──────────────────────────────────────────────────────

export async function adminDeleteAssociate(associateId, adminId) {
  const existing = await prisma.associate.findUnique({
    where: { id: associateId, deletedAt: null },
    include: { treeNode: true },
  });
  if (!existing) throw Object.assign(new Error('Associate not found'), { statusCode: 404 });

  if (existing.treeNode) {
    const childCount = await prisma.treeNode.count({
      where: { parentId: existing.treeNode.id, associate: { deletedAt: null } },
    });
    if (childCount > 0) {
      throw Object.assign(new Error('Cannot delete associate with active downline members'), { statusCode: 400 });
    }
  }

  await prisma.associate.update({ where: { id: associateId }, data: { deletedAt: new Date() } });
  await logAdminAction(adminId, 'DELETE_ASSOCIATE', 'Associate', associateId, { userId: existing.userId });
  return { success: true };
}

// ─── adminListDeletionRequests ──────────────────────────────────────────────────
export async function adminListDeletionRequests(pagination = {}) {
  const { page = 1, pageSize = 20, skip = 0, take = 20 } = pagination;

  const where = { 
    deletedAt: null,
    deletionRequestedAt: { not: null }
  };

  const [records, totalItems] = await Promise.all([
    prisma.associate.findMany({
      where,
      orderBy: { deletionRequestedAt: 'desc' },
      skip,
      take,
      select: {
        id: true,
        userId: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        rank: true,
        joiningDate: true,
        deletionRequestedAt: true,
        scheduledDeletionAt: true,
        sponsor: { select: { userId: true, name: true } },
      },
    }),
    prisma.associate.count({ where }),
  ]);

  const items = records.map((a) => ({
    ...a,
    rankName: RANK_NAMES[a.rank] || 'Unknown',
    sponsorUserId: a.sponsor?.userId || null,
  }));

  return { items, totalItems, page, pageSize };
}

// ─── adminRejectDeletionRequest ─────────────────────────────────────────────────
export async function adminRejectDeletionRequest(associateId, adminId) {
  const existing = await prisma.associate.findUnique({
    where: { id: associateId, deletedAt: null },
  });
  if (!existing) throw Object.assign(new Error('Associate not found'), { statusCode: 404 });
  if (!existing.deletionRequestedAt) {
    throw Object.assign(new Error('No deletion request pending for this associate'), { statusCode: 400 });
  }

  const updated = await prisma.associate.update({
    where: { id: associateId },
    data: {
      deletionRequestedAt: null,
      scheduledDeletionAt: null,
    },
  });

  await logAdminAction(adminId, 'REJECT_DELETION_REQUEST', 'Associate', associateId, { userId: existing.userId });
  return { success: true };
}
