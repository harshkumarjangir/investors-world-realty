import prisma from './src/utils/prisma.js';
async function run() {
  const b = await prisma.booking.findMany({
    where: { propertyId: '45906737-c6a7-4306-96f7-db69dc683041' },
    orderBy: { createdAt: 'desc' }
  });
  console.log(JSON.stringify(b.map(x => ({
    id: x.id,
    customer: x.customerName,
    status: x.status,
    date: x.createdAt
  })), null, 2));
}
run().finally(() => process.exit(0));
