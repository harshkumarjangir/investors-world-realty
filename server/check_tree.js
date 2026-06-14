import prisma from './src/utils/prisma.js';

async function main() {
  console.log('--- Associates ---');
  const allAssociates = await prisma.associate.findMany({
    select: { id: true, userId: true, name: true, sponsor: { select: { userId: true } }, status: true }
  });
  const mappedAssoc = allAssociates.map(a => ({
    userId: a.userId,
    name: a.name,
    sponsor: a.sponsor?.userId,
    status: a.status
  }));
  console.table(mappedAssoc);

  console.log('\n--- Tree Nodes ---');
  const allTreeNodes = await prisma.treeNode.findMany({
    include: {
      associate: { select: { userId: true } },
      children: { select: { associate: { select: { userId: true } }, position: true } }
    }
  });
  const nodesFormatted = allTreeNodes.map(n => ({
    associate: n.associate.userId,
    level: n.level,
    position: n.position,
    leftChildId: n.leftChildId,
    rightChildId: n.rightChildId,
    children: n.children.map(c => `${c.position}:${c.associate.userId}`).join(', ')
  }));
  console.table(nodesFormatted);
}
main().finally(() => prisma.$disconnect());
