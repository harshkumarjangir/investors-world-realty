import prisma from './src/utils/prisma.js';

async function findNextAvailablePosition(sponsorTreeNode, leg, tx = prisma) {
  const queue = [sponsorTreeNode];
  while (queue.length > 0) {
    const node = queue.shift();
    if (leg === 'LEFT' && node.leftChildId === null) return { parentNode: node, position: 'LEFT' };
    if (leg === 'RIGHT' && node.rightChildId === null) return { parentNode: node, position: 'RIGHT' };
    
    if (node.leftChildId) {
      const leftChild = await tx.treeNode.findUnique({ where: { id: node.leftChildId } });
      if (leftChild) queue.push(leftChild);
    }
    if (node.rightChildId) {
      const rightChild = await tx.treeNode.findUnique({ where: { id: node.rightChildId } });
      if (rightChild) queue.push(rightChild);
    }
  }
}

async function main() {
  const nodes = await prisma.treeNode.findMany({
    include: {
      associate: { select: { userId: true, sponsorId: true } },
      children: { select: { id: true, associate: { select: { userId: true } } } }
    }
  });

  for (const node of nodes) {
    for (const child of node.children) {
      if (node.leftChildId !== child.id && node.rightChildId !== child.id) {
        console.log(`Node ${child.associate.userId} is incorrectly attached to ${node.associate.userId}. Fixing...`);
        
        await prisma.$transaction(async (tx) => {
          // Find their sponsor
          const childNode = await tx.treeNode.findUnique({ where: { id: child.id }, include: { associate: true } });
          const sponsorId = childNode.associate.sponsorId || node.associate.sponsorId;
          const sponsorNode = await tx.treeNode.findUnique({ where: { associateId: sponsorId } });
          
          if (!sponsorNode) return;

          const { parentNode, position } = await findNextAvailablePosition(sponsorNode, 'LEFT', tx);
          
          await tx.treeNode.update({
            where: { id: child.id },
            data: {
              parentId: parentNode.id,
              position: position,
              level: parentNode.level + 1
            }
          });

          if (position === 'LEFT') {
            await tx.treeNode.update({ where: { id: parentNode.id }, data: { leftChildId: child.id } });
          } else {
            await tx.treeNode.update({ where: { id: parentNode.id }, data: { rightChildId: child.id } });
          }
          console.log(`Fixed ${child.associate.userId} -> placed under ${parentNode.associateId} at ${position}`);
        });
      }
    }
  }
  console.log('Done fixing tree nodes.');
}

main().finally(() => prisma.$disconnect());
