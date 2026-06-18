import prisma from './src/utils/prisma.js';

async function fix() {
  const count = await prisma.propertySaleCommission.updateMany({
    where: { status: 'APPROVED' },
    data: { status: 'PENDING' },
  });
  console.log(`Reverted ${count.count} stuck APPROVED commissions back to PENDING.`);
}
fix().catch(console.error).finally(() => process.exit());
