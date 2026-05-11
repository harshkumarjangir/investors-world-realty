import prisma from '../../utils/prisma.js';
import { getTree } from '../genealogy.service.js';

// ─── adminGetTree ─────────────────────────────────────────────────────────────

/**
 * Return the binary tree for an associate up to the given depth.
 * Accepts either database UUID or userId (IW######).
 * @param {string} associateIdOrUserId
 * @param {number} depth
 */
export async function adminGetTree(associateIdOrUserId, depth = 5) {
  // Resolve userId to database id if it looks like a userId pattern
  let associateId = associateIdOrUserId;
  if (/^IW\d+$/.test(associateIdOrUserId)) {
    const associate = await prisma.associate.findFirst({
      where: { userId: associateIdOrUserId, deletedAt: null },
      select: { id: true },
    });
    if (!associate) {
      throw Object.assign(new Error('Associate not found'), { statusCode: 404 });
    }
    associateId = associate.id;
  }
  return getTree(associateId, depth);
}

// ─── adminSearchAssociate ─────────────────────────────────────────────────────

/**
 * Search associates by userId or name (case-insensitive).
 * Returns matching associates with their treeNode position (level, position).
 * @param {string} query
 */
export async function adminSearchAssociate(query) {
  if (!query || query.trim() === '') {
    throw Object.assign(new Error('Search query is required'), { statusCode: 400 });
  }

  const associates = await prisma.associate.findMany({
    where: {
      deletedAt: null,
      OR: [
        { userId: { contains: query, mode: 'insensitive' } },
        { name: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: 20,
    select: {
      id: true,
      userId: true,
      name: true,
      email: true,
      status: true,
      treeNode: {
        select: { level: true, position: true },
      },
    },
  });

  return associates.map((a) => ({
    id: a.id,
    userId: a.userId,
    name: a.name,
    email: a.email,
    status: a.status,
    treePosition: a.treeNode
      ? { level: a.treeNode.level, position: a.treeNode.position }
      : null,
  }));
}

// ─── adminGetLevelAnalysis ────────────────────────────────────────────────────

/**
 * Group all TreeNodes by level.
 * For each level: count, activeCount, totalBusinessVolume (sum of package prices).
 */
export async function adminGetLevelAnalysis() {
  // Get all tree nodes with their associate status and package price
  const treeNodes = await prisma.treeNode.findMany({
    select: {
      level: true,
      associate: {
        select: {
          status: true,
          deletedAt: true,
          package: { select: { price: true } },
        },
      },
    },
  });

  // Group by level
  const levelMap = new Map();

  for (const node of treeNodes) {
    const { level, associate } = node;

    if (!levelMap.has(level)) {
      levelMap.set(level, { level, count: 0, activeCount: 0, totalBusinessVolume: 0 });
    }

    const entry = levelMap.get(level);
    entry.count += 1;

    if (associate.deletedAt === null && associate.status === 'ACTIVE') {
      entry.activeCount += 1;
      entry.totalBusinessVolume += Number(associate.package?.price || 0);
    }
  }

  // Sort by level ascending
  return Array.from(levelMap.values()).sort((a, b) => a.level - b.level);
}

// ─── adminGetBusinessTracking ─────────────────────────────────────────────────

/**
 * Return an associate's TreeNode volumes and paired volume.
 * Accepts either database UUID or userId (IW######).
 * @param {string} associateIdOrUserId
 */
export async function adminGetBusinessTracking(associateIdOrUserId) {
  let associateId = associateIdOrUserId;
  if (/^IW\d+$/.test(associateIdOrUserId)) {
    const associate = await prisma.associate.findFirst({
      where: { userId: associateIdOrUserId, deletedAt: null },
      select: { id: true },
    });
    if (!associate) {
      throw Object.assign(new Error('Associate not found'), { statusCode: 404 });
    }
    associateId = associate.id;
  }

  const treeNode = await prisma.treeNode.findUnique({
    where: { associateId },
    select: {
      leftVolume: true,
      rightVolume: true,
      carryForward: true,
    },
  });

  if (!treeNode) {
    throw Object.assign(new Error('Tree node not found for this associate'), { statusCode: 404 });
  }

  const leftVolume = Number(treeNode.leftVolume);
  const rightVolume = Number(treeNode.rightVolume);
  const carryForward = Number(treeNode.carryForward);
  const pairedVolume = Math.min(leftVolume, rightVolume);

  return {
    leftVolume,
    rightVolume,
    carryForward,
    pairedVolume,
  };
}
