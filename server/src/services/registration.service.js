import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma.js';
import {
  calculateDirectIncome,
  calculateLevelIncome,
  updateBusinessVolumes,
} from './mlm.service.js';

// ─── User ID Generation ───────────────────────────────────────────────────────

/**
 * Generate the next sequential userId in IW######  format.
 * Runs inside a serializable transaction to prevent race conditions.
 */
export async function generateUserId() {
  return prisma.$transaction(async (tx) => {
    // Lock the row by reading with a raw query so no two concurrent calls
    // can read the same "max" value before either has written.
    const result = await tx.$queryRaw`
      SELECT "userId"
      FROM "Associate"
      WHERE "userId" ~ '^IW[0-9]{6}$'
      ORDER BY "userId" DESC
      LIMIT 1
      FOR UPDATE
    `;

    let nextNumber = 100001;
    if (result.length > 0) {
      const lastNumber = parseInt(result[0].userId.slice(2), 10);
      nextNumber = lastNumber + 1;
    }

    return `IW${String(nextNumber).padStart(6, '0')}`;
  }, { isolationLevel: 'Serializable' });
}

// ─── Sponsor Validation ───────────────────────────────────────────────────────

/**
 * Find an active, non-deleted associate by their userId (e.g. IW100001).
 * Throws 400 if not found or not ACTIVE.
 */
export async function validateSponsor(sponsorId) {
  const sponsor = await prisma.associate.findFirst({
    where: {
      userId: sponsorId,
      deletedAt: null,
    },
    include: {
      treeNode: true,
    },
  });

  if (!sponsor) {
    throw Object.assign(new Error('Sponsor not found'), { statusCode: 400 });
  }

  if (sponsor.status !== 'ACTIVE') {
    throw Object.assign(new Error('Sponsor is not active'), { statusCode: 400 });
  }

  return sponsor;
}

// ─── BFS Spillover ────────────────────────────────────────────────────────────

/**
 * BFS from sponsorTreeNode in the requested leg.
 * Returns { parentNode, position } for the first open slot on that side.
 */
async function findNextAvailablePosition(sponsorTreeNode, leg) {
  const queue = [sponsorTreeNode];

  while (queue.length > 0) {
    const node = queue.shift();

    // Check the requested leg first
    if (leg === 'LEFT' && node.leftChildId === null) {
      return { parentNode: node, position: 'LEFT' };
    }
    if (leg === 'RIGHT' && node.rightChildId === null) {
      return { parentNode: node, position: 'RIGHT' };
    }

    // Enqueue existing children to continue BFS
    if (node.leftChildId) {
      const leftChild = await prisma.treeNode.findUnique({
        where: { id: node.leftChildId },
      });
      if (leftChild) queue.push(leftChild);
    }

    if (node.rightChildId) {
      const rightChild = await prisma.treeNode.findUnique({
        where: { id: node.rightChildId },
      });
      if (rightChild) queue.push(rightChild);
    }
  }

  // Should never happen in a valid binary tree
  throw Object.assign(
    new Error('No available position found in the tree'),
    { statusCode: 500 },
  );
}

// ─── Register Associate ───────────────────────────────────────────────────────

/**
 * Register a new associate.
 * Validates inputs, generates userId, places in binary tree via BFS spillover,
 * creates Wallet — all inside a single Prisma transaction.
 */
export async function registerAssociate(data) {
  const {
    name,
    phone,
    email,
    address,
    city,
    state,
    pincode,
    panNumber,
    sponsorId,
    dateOfBirth,
    password,
  } = data;

  // ── Mandatory field check ──────────────────────────────────────────────────
  const missing = [];
  if (!name) missing.push('name');
  if (!phone) missing.push('phone');
  if (!email) missing.push('email');
  if (!sponsorId) missing.push('sponsorId');
  if (!password) missing.push('password');

  if (missing.length > 0) {
    throw Object.assign(
      new Error(`Missing required fields: ${missing.join(', ')}`),
      { statusCode: 400 },
    );
  }

  // ── Uniqueness checks ──────────────────────────────────────────────────────
  const [existingPhone, existingEmail] = await Promise.all([
    prisma.associate.findUnique({ where: { phone } }),
    prisma.associate.findUnique({ where: { email } }),
  ]);

  if (existingPhone) {
    throw Object.assign(new Error('Phone number is already registered'), { statusCode: 400 });
  }
  if (existingEmail) {
    throw Object.assign(new Error('Email address is already registered'), { statusCode: 400 });
  }

  // ── Validate sponsor ───────────────────────────────────────────────────────
  const sponsor = await validateSponsor(sponsorId);

  // ── Check if sponsor can add downlines (rank-based) ────────────────────────
  const { canAddDownline } = await import('./promotion.service.js');
  const downlineCheck = await canAddDownline(sponsor.id);
  if (!downlineCheck.canAdd) {
    throw Object.assign(new Error(downlineCheck.reason), { statusCode: 400 });
  }

  // ── Generate userId ────────────────────────────────────────────────────────
  const userId = await generateUserId();

  // ── Hash password ──────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash(password, 12);

  // ── Create Associate (INACTIVE — pending admin approval) ───────────────────
  const newAssociate = await prisma.associate.create({
    data: {
      userId,
      name,
      email,
      phone,
      password: hashedPassword,
      address: address || null,
      city: city || null,
      state: state || null,
      pincode: pincode || null,
      panNumber: panNumber || null,
      sponsorId: sponsor.id,
      status: 'INACTIVE',
      rank: 1,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
    },
  });

  return newAssociate;
}

// ─── Activate Associate ───────────────────────────────────────────────────────
export async function activateAssociate(associateId) {
  // ── Validate associate ─────────────────────────────────────────────────────
  const associate = await prisma.associate.findUnique({
    where: { id: associateId },
  });

  if (!associate) {
    throw Object.assign(new Error('Associate not found'), { statusCode: 404 });
  }

  if (associate.status !== 'INACTIVE') {
    throw Object.assign(
      new Error('Associate is not in INACTIVE status'),
      { statusCode: 400 },
    );
  }

  // ── Activate: set status, create wallet, place in tree ─────────────────────
  const updated = await prisma.$transaction(async (tx) => {
    // 1. Update status
    const activated = await tx.associate.update({
      where: { id: associateId },
      data: {
        status: 'ACTIVE',
        activationDate: new Date(),
      },
    });

    // 2. Create Wallet if not exists
    const existingWallet = await tx.wallet.findUnique({ where: { associateId } });
    if (!existingWallet) {
      await tx.wallet.create({
        data: {
          associateId,
          balance: 0,
          totalCredits: 0,
          totalDebits: 0,
        },
      });
    }

    // 3. Create TreeNode if not exists (place under sponsor)
    const existingNode = await tx.treeNode.findUnique({ where: { associateId } });
    if (!existingNode && associate.sponsorId) {
      const sponsorNode = await tx.treeNode.findUnique({ where: { associateId: associate.sponsorId } });
      const level = sponsorNode ? sponsorNode.level + 1 : 1;
      await tx.treeNode.create({
        data: {
          associateId,
          parentId: sponsorNode?.id || null,
          position: 'LEFT',
          level,
        },
      });
    }

    return activated;
  });

  return updated;
}
