import prisma from './src/utils/prisma.js';

async function run() {
  const transactions = await prisma.transaction.findMany({
    include: { wallet: { include: { associate: true } } }
  });
  console.log(JSON.stringify(transactions.map(t => ({
    amount: t.amount,
    associate: t.wallet.associate.name
  })), null, 2));

  const commissions = await prisma.propertySaleCommission.findMany();
  console.log(JSON.stringify(commissions.map(c => ({
    name: c.associateId,
    amount: c.commissionAmount,
    status: c.status
  })), null, 2));
}
run().finally(() => process.exit());
