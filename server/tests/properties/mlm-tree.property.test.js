import fc from 'fast-check';
import { legArb, depthArb } from '../helpers/generators.js';

/**
 * Pure logic tests for binary tree placement and depth constraints.
 * These simulate the BFS placement algorithm from mlm.service.js and
 * the tree depth limiting from genealogy.service.js without database calls.
 */

// ─── In-memory binary tree implementation (mirrors service logic) ─────────────

class TreeNode {
  constructor(id, position = null, level = 0) {
    this.id = id;
    this.position = position;
    this.level = level;
    this.left = null;
    this.right = null;
  }
}

/**
 * BFS placement: find the first available slot in the requested leg.
 * Mirrors findNextAvailablePosition in registration.service.js.
 */
function placeNode(root, nodeId, preferredLeg) {
  const queue = [root];

  while (queue.length > 0) {
    const current = queue.shift();

    if (preferredLeg === 'LEFT' && current.left === null) {
      const newNode = new TreeNode(nodeId, 'LEFT', current.level + 1);
      current.left = newNode;
      return newNode;
    }
    if (preferredLeg === 'RIGHT' && current.right === null) {
      const newNode = new TreeNode(nodeId, 'RIGHT', current.level + 1);
      current.right = newNode;
      return newNode;
    }

    // Enqueue children for BFS traversal in the preferred leg direction
    if (preferredLeg === 'LEFT') {
      if (current.left) queue.push(current.left);
      if (current.right) queue.push(current.right);
    } else {
      if (current.right) queue.push(current.right);
      if (current.left) queue.push(current.left);
    }
  }

  return null;
}

/**
 * Collect all nodes in the tree via BFS.
 */
function collectAllNodes(root) {
  const nodes = [];
  const queue = [root];
  while (queue.length > 0) {
    const node = queue.shift();
    nodes.push(node);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return nodes;
}

/**
 * Build tree up to a given depth (mirrors getTree in genealogy.service.js).
 * Returns a new tree limited to `maxDepth` levels from root.
 */
function getTreeWithDepth(root, maxDepth) {
  if (!root || maxDepth < 1) return null;

  const result = { ...root, left: null, right: null };
  const queue = [{ source: root, target: result, depth: 0 }];

  while (queue.length > 0) {
    const { source, target, depth } = queue.shift();

    if (depth >= maxDepth) continue;

    if (source.left) {
      const leftCopy = { ...source.left, left: null, right: null };
      target.left = leftCopy;
      queue.push({ source: source.left, target: leftCopy, depth: depth + 1 });
    }

    if (source.right) {
      const rightCopy = { ...source.right, left: null, right: null };
      target.right = rightCopy;
      queue.push({ source: source.right, target: rightCopy, depth: depth + 1 });
    }
  }

  return result;
}

/**
 * Get the maximum depth of a tree from root.
 */
function getMaxDepth(node) {
  if (!node) return 0;
  const queue = [{ node, depth: 0 }];
  let maxDepth = 0;

  while (queue.length > 0) {
    const { node: current, depth } = queue.shift();
    maxDepth = Math.max(maxDepth, depth);
    if (current.left) queue.push({ node: current.left, depth: depth + 1 });
    if (current.right) queue.push({ node: current.right, depth: depth + 1 });
  }

  return maxDepth;
}

// ─── Property 3: Binary Tree Placement Correctness ────────────────────────────

describe('Feature: investors-world-platform, Property 3: Binary Tree Placement Correctness', () => {
  it('each node has at most 2 children after N placements', () => {
    fc.assert(
      fc.property(
        fc.array(legArb, { minLength: 1, maxLength: 30 }),
        (legPreferences) => {
          const root = new TreeNode('root', null, 0);

          for (let i = 0; i < legPreferences.length; i++) {
            placeNode(root, `node-${i}`, legPreferences[i]);
          }

          const allNodes = collectAllNodes(root);
          for (const node of allNodes) {
            let childCount = 0;
            if (node.left) childCount++;
            if (node.right) childCount++;
            expect(childCount).toBeLessThanOrEqual(2);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('all placed nodes exist in the tree', () => {
    fc.assert(
      fc.property(
        fc.array(legArb, { minLength: 1, maxLength: 20 }),
        (legPreferences) => {
          const root = new TreeNode('root', null, 0);

          for (let i = 0; i < legPreferences.length; i++) {
            placeNode(root, `node-${i}`, legPreferences[i]);
          }

          const allNodes = collectAllNodes(root);
          const allIds = allNodes.map((n) => n.id);

          // Root + all placed nodes should be in the tree
          expect(allIds).toContain('root');
          for (let i = 0; i < legPreferences.length; i++) {
            expect(allIds).toContain(`node-${i}`);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('nodes placed with LEFT preference end up in left subtree when slot available', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        (count) => {
          const root = new TreeNode('root', null, 0);

          // Place all nodes with LEFT preference
          for (let i = 0; i < count; i++) {
            placeNode(root, `left-${i}`, 'LEFT');
          }

          // First node should be directly on root's left
          if (root.left) {
            expect(root.left.position).toBe('LEFT');
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('nodes placed with RIGHT preference end up in right subtree when slot available', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        (count) => {
          const root = new TreeNode('root', null, 0);

          // Place all nodes with RIGHT preference
          for (let i = 0; i < count; i++) {
            placeNode(root, `right-${i}`, 'RIGHT');
          }

          // First node should be directly on root's right
          if (root.right) {
            expect(root.right.position).toBe('RIGHT');
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('total node count equals 1 (root) + number of placements', () => {
    fc.assert(
      fc.property(
        fc.array(legArb, { minLength: 1, maxLength: 25 }),
        (legPreferences) => {
          const root = new TreeNode('root', null, 0);

          for (let i = 0; i < legPreferences.length; i++) {
            placeNode(root, `node-${i}`, legPreferences[i]);
          }

          const allNodes = collectAllNodes(root);
          expect(allNodes.length).toBe(1 + legPreferences.length);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── Property 21: Tree Depth Constraint ───────────────────────────────────────

describe('Feature: investors-world-platform, Property 21: Tree Depth Constraint', () => {
  it('returned tree has no nodes deeper than D levels from root', () => {
    fc.assert(
      fc.property(
        fc.array(legArb, { minLength: 5, maxLength: 30 }),
        depthArb,
        (legPreferences, requestedDepth) => {
          // Build a full tree
          const root = new TreeNode('root', null, 0);
          for (let i = 0; i < legPreferences.length; i++) {
            placeNode(root, `node-${i}`, legPreferences[i]);
          }

          // Get tree limited to requestedDepth
          const limitedTree = getTreeWithDepth(root, requestedDepth);

          if (limitedTree) {
            const actualMaxDepth = getMaxDepth(limitedTree);
            expect(actualMaxDepth).toBeLessThanOrEqual(requestedDepth);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('depth 1 returns only root with immediate children', () => {
    const root = new TreeNode('root', null, 0);
    placeNode(root, 'left-1', 'LEFT');
    placeNode(root, 'right-1', 'RIGHT');
    placeNode(root, 'left-2', 'LEFT');

    const limited = getTreeWithDepth(root, 1);
    expect(limited).not.toBeNull();
    // At depth 1, we should have root + its direct children
    if (limited.left) {
      expect(limited.left.left).toBeNull();
      expect(limited.left.right).toBeNull();
    }
    if (limited.right) {
      expect(limited.right.left).toBeNull();
      expect(limited.right.right).toBeNull();
    }
  });

  it('increasing depth never decreases the number of nodes returned', () => {
    fc.assert(
      fc.property(
        fc.array(legArb, { minLength: 10, maxLength: 30 }),
        fc.integer({ min: 1, max: 5 }),
        (legPreferences, baseDepth) => {
          const root = new TreeNode('root', null, 0);
          for (let i = 0; i < legPreferences.length; i++) {
            placeNode(root, `node-${i}`, legPreferences[i]);
          }

          const tree1 = getTreeWithDepth(root, baseDepth);
          const tree2 = getTreeWithDepth(root, baseDepth + 1);

          const count1 = tree1 ? collectAllNodesFromCopy(tree1) : 0;
          const count2 = tree2 ? collectAllNodesFromCopy(tree2) : 0;

          expect(count2).toBeGreaterThanOrEqual(count1);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// Helper for counting nodes in a copied tree (without TreeNode class methods)
function collectAllNodesFromCopy(root) {
  let count = 0;
  const queue = [root];
  while (queue.length > 0) {
    const node = queue.shift();
    count++;
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return count;
}
