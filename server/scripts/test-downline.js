import prisma from '../src/utils/prisma.js';

async function main() {
  // Get IW100001's tree node
  const associate = await prisma.associate.findFirst({
    where: { userId: 'IW100001' },
    select: { id: true, userId: true, name: true },
  });

  if (!associate) { console.log('IW100001 not found'); process.exit(1); }

  const treeNode = await prisma.treeNode.findUnique({
    where: { associateId: associate.id },
  });

  if (!treeNode) { console.log('No tree node for IW100001'); process.exit(1); }

  // Find direct children (nodes whose parentId = this node's id)
  const children = await prisma.treeNode.findMany({
    where: { parentId: treeNode.id },
    include: { associate: { select: { userId: true, name: true, phone: true, status: true, sponsorId: true, rank: true, totalAreaSold: true } } },
  });

  console.log(`IW100001 has ${children.length} direct downline(s):`);
  children.forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.associate.userId} | ${c.associate.name} | ${c.associate.phone} | ${c.associate.status} | Rank: ${c.associate.rank}`);
  });

  process.exit(0);
}
main();
