import prisma from '../utils/prisma.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Fetch a TreeNode with its associate (name, userId, status, position, level).
 */
async function fetchNode(treeNodeId) {
  return prisma.treeNode.findUnique({
    where: { id: treeNodeId },
    include: {
      associate: {
        select: { id: true, userId: true, name: true, phone: true, status: true, rank: true, totalAreaSold: true, joiningDate: true },
      },
    },
  });
}

// ─── getTree ──────────────────────────────────────────────────────────────────

/**
 * Build a binary tree up to `depth` levels using iterative BFS.
 * Returns nested objects: { associateId, userId, name, status, position, level, left, right }
 */
export async function getTree(associateId, depth = 5) {
  const cap = Math.min(Math.max(parseInt(depth, 10) || 5, 1), 10);

  // Find the root TreeNode for this associate
  const rootNode = await prisma.treeNode.findUnique({
    where: { associateId },
    include: {
      associate: {
        select: { id: true, userId: true, name: true, status: true },
      },
    },
  });

  if (!rootNode) {
    throw Object.assign(new Error('Tree node not found for this associate'), { statusCode: 404 });
  }

  // BFS: queue items are { node, resultRef, currentDepth }
  // We build the result object in-place by mutating resultRef
  const rootResult = {
    associateId: rootNode.associateId,
    userId: rootNode.associate.userId,
    name: rootNode.associate.name,
    status: rootNode.associate.status,
    position: rootNode.position,
    level: rootNode.level,
    left: null,
    right: null,
  };

  const queue = [{ node: rootNode, resultRef: rootResult, currentDepth: 0 }];

  while (queue.length > 0) {
    const { node, resultRef, currentDepth } = queue.shift();

    if (currentDepth >= cap) continue;

    // Fetch left child
    if (node.leftChildId) {
      const leftNode = await fetchNode(node.leftChildId);
      if (leftNode) {
        const leftResult = {
          associateId: leftNode.associateId,
          userId: leftNode.associate.userId,
          name: leftNode.associate.name,
          phone: leftNode.associate.phone,
          status: leftNode.associate.status,
          rank: leftNode.associate.rank,
          totalAreaSold: leftNode.associate.totalAreaSold,
          joiningDate: leftNode.associate.joiningDate,
          position: leftNode.position,
          level: leftNode.level,
          left: null,
          right: null,
        };
        resultRef.left = leftResult;
        queue.push({ node: leftNode, resultRef: leftResult, currentDepth: currentDepth + 1 });
      }
    }

    // Fetch right child
    if (node.rightChildId) {
      const rightNode = await fetchNode(node.rightChildId);
      if (rightNode) {
        const rightResult = {
          associateId: rightNode.associateId,
          userId: rightNode.associate.userId,
          name: rightNode.associate.name,
          phone: rightNode.associate.phone,
          status: rightNode.associate.status,
          rank: rightNode.associate.rank,
          totalAreaSold: rightNode.associate.totalAreaSold,
          joiningDate: rightNode.associate.joiningDate,
          position: rightNode.position,
          level: rightNode.level,
          left: null,
          right: null,
        };
        resultRef.right = rightResult;
        queue.push({ node: rightNode, resultRef: rightResult, currentDepth: currentDepth + 1 });
      }
    }
  }

  return rootResult;
}

// ─── getDownline ──────────────────────────────────────────────────────────────

/**
 * BFS from associate's TreeNode, collect all descendants.
 * Filters: status, leg ('left'|'right'), level (exact depth from root).
 * Returns paginated list.
 */
export async function getDownline(associateId, filters = {}, pagination = {}) {
  const { status, leg, level } = filters;
  const { page = 1, pageSize = 20, skip = 0, take = 20 } = pagination;

  const rootNode = await prisma.treeNode.findUnique({
    where: { associateId },
  });

  if (!rootNode) {
    throw Object.assign(new Error('Tree node not found for this associate'), { statusCode: 404 });
  }

  // BFS — collect all descendant node IDs with their depth from root
  // We track which "leg" (left/right from root) each node belongs to
  const allDescendants = []; // { treeNodeId, depthFromRoot, legFromRoot }

  const queue = [];

  // Seed queue with direct children
  if (rootNode.leftChildId) {
    queue.push({ nodeId: rootNode.leftChildId, depthFromRoot: 1, legFromRoot: 'left' });
  }
  if (rootNode.rightChildId) {
    queue.push({ nodeId: rootNode.rightChildId, depthFromRoot: 1, legFromRoot: 'right' });
  }

  while (queue.length > 0) {
    const { nodeId, depthFromRoot, legFromRoot } = queue.shift();

    const node = await prisma.treeNode.findUnique({
      where: { id: nodeId },
    });

    if (!node) continue;

    allDescendants.push({ treeNodeId: node.id, associateId: node.associateId, depthFromRoot, legFromRoot });

    if (node.leftChildId) {
      queue.push({ nodeId: node.leftChildId, depthFromRoot: depthFromRoot + 1, legFromRoot });
    }
    if (node.rightChildId) {
      queue.push({ nodeId: node.rightChildId, depthFromRoot: depthFromRoot + 1, legFromRoot });
    }
  }

  // Apply leg and level filters on the collected list
  let filtered = allDescendants;

  if (leg) {
    const normalizedLeg = leg.toLowerCase();
    filtered = filtered.filter((d) => d.legFromRoot === normalizedLeg);
  }

  if (level !== undefined && level !== null && level !== '') {
    const levelNum = parseInt(level, 10);
    filtered = filtered.filter((d) => d.depthFromRoot === levelNum);
  }

  // Fetch associate details for filtered nodes
  const associateIds = filtered.map((d) => d.associateId);

  let associates = await prisma.associate.findMany({
    where: {
      id: { in: associateIds },
      deletedAt: null,
      ...(status ? { status } : {}),
    },
    select: {
      id: true,
      userId: true,
      name: true,
      status: true,
      joiningDate: true,
    },
  });

  // Build a map for quick lookup
  const associateMap = new Map(associates.map((a) => [a.id, a]));

  // Merge with depth/leg info, keeping only those that passed status filter
  const merged = filtered
    .filter((d) => associateMap.has(d.associateId))
    .map((d) => {
      const a = associateMap.get(d.associateId);
      return {
        userId: a.userId,
        name: a.name,
        status: a.status,
        joiningDate: a.joiningDate,
        level: d.depthFromRoot,
        position: d.legFromRoot,
      };
    });

  const totalItems = merged.length;
  const paginated = merged.slice(skip, skip + take);

  return { items: paginated, totalItems, page, pageSize };
}

// ─── getSponsor ───────────────────────────────────────────────────────────────

/**
 * Return the sponsor's name, userId, phone, email.
 */
export async function getSponsor(associateId) {
  const associate = await prisma.associate.findUnique({
    where: { id: associateId },
    select: {
      sponsor: {
        select: { name: true, userId: true, phone: true, email: true },
      },
    },
  });

  if (!associate) {
    throw Object.assign(new Error('Associate not found'), { statusCode: 404 });
  }

  if (!associate.sponsor) {
    throw Object.assign(new Error('No sponsor found for this associate'), { statusCode: 404 });
  }

  return associate.sponsor;
}

// ─── getTeamSummary ───────────────────────────────────────────────────────────

/**
 * Return { leftVolume, rightVolume } from the associate's TreeNode.
 */
export async function getTeamSummary(associateId) {
  const treeNode = await prisma.treeNode.findUnique({
    where: { associateId },
    select: { leftVolume: true, rightVolume: true },
  });

  if (!treeNode) {
    throw Object.assign(new Error('Tree node not found for this associate'), { statusCode: 404 });
  }

  return {
    leftVolume: Number(treeNode.leftVolume),
    rightVolume: Number(treeNode.rightVolume),
  };
}
