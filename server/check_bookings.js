import prisma from './src/utils/prisma.js';
async function run() {
  const b = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { property: true }
  });
  console.log(JSON.stringify(b.map(x => ({
    id: x.id,
    customer: x.customerName,
    prop: x.property?.name,
    status: x.status,
    date: x.createdAt
  })), null, 2));
}
run().finally(() => process.exit(0));
