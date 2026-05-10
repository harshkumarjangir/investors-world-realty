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
    packageId,
    sponsorId,
    placement,
    dateOfBirth,
    password,
  } = data;

  // ── Mandatory field check ──────────────────────────────────────────────────
  const missing = [];
  if (!name) missing.push('name');
  if (!phone) missing.push('phone');
  if (!email) missing.push('email');
  if (!address) missing.push('address');
  if (!panNumber) missing.push('panNumber');
  if (!packageId) missing.push('packageId');
  if (!sponsorId) missing.push('sponsorId');
  if (!placement) missing.push('placement');
  if (!password) missing.push('password');

  if (missing.length > 0) {
    throw Object.assign(
      new Error(`Missing required fields: ${missing.join(', ')}`),
      { statusCode: 400 },
    );
  }

  if (!['LEFT', 'RIGHT'].includes(placement)) {
    throw Object.assign(new Error('placement must be LEFT or RIGHT'), { statusCode: 400 });
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

  if (!sponsor.treeNode) {
    throw Object.assign(new Error('Sponsor does not have a tree node'), { statusCode: 400 });
  }

  // ── Validate package ───────────────────────────────────────────────────────
  const pkg = await prisma.package.findUnique({ where: { id: packageId } });
  if (!pkg || !pkg.isActive) {
    throw Object.assign(new Error('Package not found or inactive'), { statusCode: 400 });
  }

  // ── BFS to find placement position ────────────────────────────────────────
  const { parentNode, position } = await findNextAvailablePosition(
    sponsor.treeNode,
    placement,
  );

  // ── Generate userId ────────────────────────────────────────────────────────
  const userId = await generateUserId();

  // ── Hash password ──────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash(password, 12);

  // ── Single transaction: create Associate + TreeNode + Wallet ──────────────
  const newAssociate = await prisma.$transaction(async (tx) => {
    // 1. Create the associate
    const associate = await tx.associate.create({
      data: {
        userId,
        name,
        email,
        phone,
        password: hashedPassword,
        address,
        city,
        state,
        pincode,
        panNumber,
        packageId,
        sponsorId: sponsor.id,
        status: 'INACTIVE',
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      },
    });

    // 2. Create the TreeNode
    const treeNode = await tx.treeNode.create({
      data: {
        associateId: associate.id,
        parentId: parentNode.id,
        position,
        level: parentNode.level + 1,
      },
    });

    // 3. Update parent's leftChildId or rightChildId
    await tx.treeNode.update({
      where: { id: parentNode.id },
      data: position === 'LEFT'
        ? { leftChildId: treeNode.id }
        : { rightChildId: treeNode.id },
    });

    // 4. Create Wallet with zero balance
    await tx.wallet.create({
      data: {
        associateId: associate.id,
        balance: 0,
        totalCredits: 0,
        totalDebits: 0,
      },
    });

    return associate;
  });

  return newAssociate;
}

// ─── Activate Associate ───────────────────────────────────────────────────────

/**
 * Activate an INACTIVE associate.
 * Sets status = ACTIVE, activationDate = now(), updates packageId.
 * Stubs out MLM income calculation (Phase 4).
 */
export async function activateAssociate(associateId, packageId) {
  // ── Validate associate ─────────────────────────────────────────────────────
  const associate = await prisma.associate.findUnique({
    where: { id: associateId },
    include: { treeNode: true },
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

  // ── Validate package ───────────────────────────────────────────────────────
  const pkg = await prisma.package.findUnique({ where: { id: packageId } });
  if (!pkg || !pkg.isActive) {
    throw Object.assign(new Error('Package not found or inactive'), { statusCode: 400 });
  }

  // ── Activate ───────────────────────────────────────────────────────────────
  const updated = await prisma.associate.update({
    where: { id: associateId },
    data: {
      status: 'ACTIVE',
      activationDate: new Date(),
      packageId,
    },
    include: { package: true },
  });

  // ── MLM income triggers (Phase 4) ─────────────────────────────────────────
  // Fire-and-forget: errors here should not fail the activation response
  try {
    if (updated.sponsorId) {
      await calculateDirectIncome(updated.sponsorId, packageId, associateId);
    }
    await calculateLevelIncome(associateId);
    await updateBusinessVolumes(associateId, Number(updated.package.price));
  } catch (mlmErr) {
    console.error('[MLM] Income calculation error on activation:', mlmErr);
  }

  return updated;
}
