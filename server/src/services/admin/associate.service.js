import prisma from '../../utils/prisma.js';
import { logAdminAction } from '../../middleware/auditLog.js';
import { registerAssociate, activateAssociate } from '../registration.service.js';

// ─── adminListAssociates ──────────────────────────────────────────────────────

/**
 * Return a paginated list of associates with optional filters.
 * @param {{ status?: string, search?: string }} filters
 * @param {{ page, pageSize, skip, take }} pagination
 */
export async function adminListAssociates(filters = {}, pagination = {}) {
  const { status, search } = filters;
  const { page = 1, pageSize = 20, skip = 0, take = 20 } = pagination;

  const where = { deletedAt: null };

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { userId: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [records, totalItems] = await Promise.all([
    prisma.associate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      select: {
        id: true,
        userId: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        joiningDate: true,
        package: { select: { name: true } },
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
    status: a.status,
    joiningDate: a.joiningDate,
    packageName: a.package?.name || null,
  }));

  return { items, totalItems, page, pageSize };
}

// ─── adminGetAssociate ────────────────────────────────────────────────────────

/**
 * Return complete profile + KYC status + wallet balance + income summary + team stats.
 * @param {string} associateId
 */
export async function adminGetAssociate(associateId) {
  const associate = await prisma.associate.findUnique({
    where: { id: associateId },
    include: {
      package: { select: { id: true, name: true, price: true } },
      kycDocuments: {
        select: { type: true, status: true, documentNumber: true, createdAt: true },
      },
      wallet: {
        select: { balance: true, totalCredits: true, totalDebits: true },
      },
      treeNode: {
        select: { level: true, position: true, leftVolume: true, rightVolume: true, carryForward: true },
      },
    },
  });

  if (!associate) {
    throw Object.assign(new Error('Associate not found'), { statusCode: 404 });
  }

  // Income summary
  const incomeSummary = await prisma.incomeRecord.groupBy({
    by: ['type'],
    where: { associateId },
    _sum: { amount: true },
  });

  const incomeByType = {};
  for (const row of incomeSummary) {
    incomeByType[row.type] = Number(row._sum.amount || 0);
  }

  // Team stats: count of left and right subtree members
  const treeNode = associate.treeNode;
  let leftCount = 0;
  let rightCount = 0;

  if (treeNode) {
    // Count all descendants on each side
    const countSubtree = async (nodeId) => {
      if (!nodeId) return 0;
      let count = 1;
      const node = await prisma.treeNode.findUnique({ where: { id: nodeId } });
      if (!node) return 0;
      count += await countSubtree(node.leftChildId);
      count += await countSubtree(node.rightChildId);
      return count;
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
    joiningDate: associate.joiningDate,
    activationDate: associate.activationDate,
    package: associate.package,
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
      leftVolume: treeNode ? Number(treeNode.leftVolume) : 0,
      rightVolume: treeNode ? Number(treeNode.rightVolume) : 0,
      level: treeNode?.level ?? null,
      position: treeNode?.position ?? null,
    },
  };
}

// ─── adminRegisterAssociate ───────────────────────────────────────────────────

/**
 * Register a new associate on behalf of an admin.
 * @param {object} data
 * @param {string} adminId
 */
export async function adminRegisterAssociate(data, adminId) {
  const associate = await registerAssociate(data);

  await logAdminAction(
    adminId,
    'REGISTER_ASSOCIATE',
    'Associate',
    associate.id,
    { userId: associate.userId, name: associate.name },
  );

  return associate;
}

// ─── adminEditAssociate ───────────────────────────────────────────────────────

/**
 * Edit allowed fields on an associate.
 * @param {string} associateId
 * @param {object} data
 * @param {string} adminId
 */
export async function adminEditAssociate(associateId, data, adminId) {
  const existing = await prisma.associate.findUnique({
    where: { id: associateId, deletedAt: null },
  });

  if (!existing) {
    throw Object.assign(new Error('Associate not found'), { statusCode: 404 });
  }

  const { name, email, phone, address, city, state, pincode, status } = data;

  const updated = await prisma.associate.update({
    where: { id: associateId },
    data: {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(state !== undefined && { state }),
      ...(pincode !== undefined && { pincode }),
      ...(status !== undefined && { status }),
    },
    select: {
      id: true,
      userId: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      city: true,
      state: true,
      pincode: true,
      status: true,
    },
  });

  await logAdminAction(
    adminId,
    'EDIT_ASSOCIATE',
    'Associate',
    associateId,
    { changes: data },
  );

  return updated;
}

// ─── adminActivateAssociate ───────────────────────────────────────────────────

/**
 * Activate an associate using the registration service.
 * @param {string} associateId
 * @param {string} packageId
 * @param {string} adminId
 */
export async function adminActivateAssociate(associateId, packageId, adminId) {
  const associate = await activateAssociate(associateId, packageId);

  await logAdminAction(
    adminId,
    'ACTIVATE_ASSOCIATE',
    'Associate',
    associateId,
    { packageId },
  );

  return associate;
}

// ─── adminSuspendAssociate ────────────────────────────────────────────────────

/**
 * Set associate status to SUSPENDED.
 * @param {string} associateId
 * @param {string} adminId
 */
export async function adminSuspendAssociate(associateId, adminId) {
  const existing = await prisma.associate.findUnique({
    where: { id: associateId, deletedAt: null },
  });

  if (!existing) {
    throw Object.assign(new Error('Associate not found'), { statusCode: 404 });
  }

  const updated = await prisma.associate.update({
    where: { id: associateId },
    data: { status: 'SUSPENDED' },
    select: { id: true, userId: true, name: true, status: true },
  });

  await logAdminAction(
    adminId,
    'SUSPEND_ASSOCIATE',
    'Associate',
    associateId,
    { previousStatus: existing.status },
  );

  return updated;
}

// ─── adminDeleteAssociate ─────────────────────────────────────────────────────

/**
 * Soft-delete an associate.
 * Throws 400 if the associate has any non-deleted downline members.
 * @param {string} associateId
 * @param {string} adminId
 */
export async function adminDeleteAssociate(associateId, adminId) {
  const existing = await prisma.associate.findUnique({
    where: { id: associateId, deletedAt: null },
    include: { treeNode: true },
  });

  if (!existing) {
    throw Object.assign(new Error('Associate not found'), { statusCode: 404 });
  }

  // Check for non-deleted downline members via TreeNode children
  if (existing.treeNode) {
    const childCount = await prisma.treeNode.count({
      where: {
        parentId: existing.treeNode.id,
        associate: { deletedAt: null },
      },
    });

    if (childCount > 0) {
      throw Object.assign(
        new Error('Cannot delete associate with active downline members'),
        { statusCode: 400 },
      );
    }
  }

  await prisma.associate.update({
    where: { id: associateId },
    data: { deletedAt: new Date() },
  });

  await logAdminAction(
    adminId,
    'DELETE_ASSOCIATE',
    'Associate',
    associateId,
    { userId: existing.userId, name: existing.name },
  );

  return { success: true };
}
