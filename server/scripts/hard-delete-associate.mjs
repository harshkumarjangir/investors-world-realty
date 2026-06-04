/**
 * Hard delete an associate and all related data.
 * Usage: node scripts/hard-delete-associate.mjs IW100033
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const userId = process.argv[2];

if (!userId) {
  console.error('Usage: node scripts/hard-delete-associate.mjs <userId>');
  console.error('Example: node scripts/hard-delete-associate.mjs IW100033');
  process.exit(1);
}

async function main() {
  const associate = await prisma.associate.findUnique({
    where: { userId },
    select: { id: true, userId: true, name: true, email: true, status: true },
  });

  if (!associate) {
    console.error(`❌ Associate "${userId}" not found`);
    process.exit(1);
  }

  console.log(`\nFound: ${associate.userId} — ${associate.name} (${associate.email}) [${associate.status}]`);
  console.log('This will permanently delete this associate and ALL related data.');
  console.log('Press Ctrl+C within 5 seconds to cancel...\n');

  await new Promise((r) => setTimeout(r, 5000));

  const id = associate.id;

  console.log('Deleting related data...');

  // 1. Tickets and messages
  const tickets = await prisma.supportTicket.findMany({ where: { associateId: id }, select: { id: true } });
  for (const t of tickets) await prisma.ticketMessage.deleteMany({ where: { ticketId: t.id } });
  await prisma.supportTicket.deleteMany({ where: { associateId: id } });
  console.log('  ✓ Support tickets');

  // 2. Notifications, device tokens
  await prisma.notification.deleteMany({ where: { associateId: id } });
  await prisma.deviceToken.deleteMany({ where: { associateId: id } });
  console.log('  ✓ Notifications, device tokens');

  // 3. Financial records
  await prisma.propertySaleCommission.deleteMany({ where: { associateId: id } });
  await prisma.advancePayment.deleteMany({ where: { associateId: id } });
  await prisma.withdrawalRequest.deleteMany({ where: { associateId: id } });
  await prisma.incomeRecord.deleteMany({ where: { associateId: id } });
  console.log('  ✓ Commissions, advance payments, withdrawals, income');

  // 4. Wallet transactions then wallet
  const wallet = await prisma.wallet.findUnique({ where: { associateId: id } });
  if (wallet) {
    await prisma.transaction.deleteMany({ where: { walletId: wallet.id } });
    await prisma.wallet.delete({ where: { associateId: id } });
  }
  console.log('  ✓ Wallet & transactions');

  // 5. KYC, bookings
  await prisma.kYCDocument.deleteMany({ where: { associateId: id } });
  await prisma.booking.deleteMany({ where: { associateId: id } });
  await prisma.propertyInquiry.deleteMany({ where: { associateId: id } });
  console.log('  ✓ KYC, bookings, inquiries');

  // 6. Tree node — clear self-references first
  const node = await prisma.treeNode.findUnique({ where: { associateId: id } });
  if (node) {
    // Detach children from this node (point them to grandparent)
    await prisma.treeNode.updateMany({
      where: { parentId: node.id },
      data: { parentId: node.parentId ?? null },
    });
    // Clear parent's child pointer if it points to this node
    if (node.parentId) {
      const parent = await prisma.treeNode.findUnique({ where: { id: node.parentId } });
      if (parent?.leftChildId === node.id) await prisma.treeNode.update({ where: { id: parent.id }, data: { leftChildId: null } });
      if (parent?.rightChildId === node.id) await prisma.treeNode.update({ where: { id: parent.id }, data: { rightChildId: null } });
    }
    await prisma.treeNode.update({ where: { id: node.id }, data: { leftChildId: null, rightChildId: null, parentId: null } });
    await prisma.treeNode.delete({ where: { id: node.id } });
  }
  console.log('  ✓ Tree node');

  // 7. Admin audit logs referencing this associate
  await prisma.adminAuditLog.deleteMany({ where: { entityId: id } });
  console.log('  ✓ Audit logs');

  // 8. Sponsored associates — remove this as their sponsor
  await prisma.associate.updateMany({ where: { sponsorId: id }, data: { sponsorId: null } });
  console.log('  ✓ Unlinked sponsored associates');

  // 9. Delete the associate
  await prisma.associate.delete({ where: { id } });
  console.log(`\n✅ Associate ${associate.userId} (${associate.name}) permanently deleted.`);
}

main()
  .catch((e) => { console.error('❌ Failed:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
