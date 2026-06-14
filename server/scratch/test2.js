import prisma from '../src/config/prisma.js';

async function check() {
  const associate = await prisma.associate.findFirst({ where: { userId: 'IW100001' }, include: { wallet: true } });
  console.log('Associate:', associate.userId, 'Wallet ID:', associate.wallet?.id);
  
  if (associate.wallet) {
    const tx = await prisma.transaction.findMany({ where: { walletId: associate.wallet.id } });
    console.log('Transactions:', tx.length);
    if(tx.length > 0) console.log(tx[0]);
    
    const wr = await prisma.withdrawalRequest.findMany({ where: { associateId: associate.id } });
    console.log('Withdrawal Requests:', wr.length);
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
