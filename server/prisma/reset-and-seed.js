/**
 * reset-and-seed.js
 * Wipes ALL data then re-seeds from scratch.
 * Run: node prisma/reset-and-seed.js
 */

import 'dotenv/config';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function resetDatabase() {
  console.log('⚠️  Wiping all database data...\n');

  // Leaf / dependent tables first
  await prisma.adminAuditLog.deleteMany({});
  await prisma.ticketMessage.deleteMany({});
  await prisma.supportTicket.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.deviceToken.deleteMany({});
  await prisma.propertyInquiry.deleteMany({});
  await prisma.contactInquiry.deleteMany({});
  console.log('   ✓ Logs, tickets, notifications, devices');

  await prisma.propertySaleCommission.deleteMany({});
  await prisma.advancePayment.deleteMany({});
  await prisma.withdrawalRequest.deleteMany({});
  await prisma.incomeRecord.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.wallet.deleteMany({});
  await prisma.payout.deleteMany({});
  console.log('   ✓ Financial records (commissions, wallet, income, withdrawals)');

  await prisma.kYCDocument.deleteMany({});
  await prisma.booking.deleteMany({});
  console.log('   ✓ KYC documents, bookings');

  // Tree self-references must be cleared before deleting rows
  await prisma.treeNode.updateMany({
    data: { leftChildId: null, rightChildId: null, parentId: null },
  });
  await prisma.treeNode.deleteMany({});
  await prisma.associate.deleteMany({});
  console.log('   ✓ Binary tree nodes, associates');

  await prisma.propertyImage.deleteMany({});
  await prisma.propertyVideo.deleteMany({});
  await prisma.property.deleteMany({});
  console.log('   ✓ Properties, images, videos');

  await prisma.schemeImage.deleteMany({});
  await prisma.plot.deleteMany({});
  await prisma.scheme.deleteMany({});
  await prisma.plotType.deleteMany({});
  await prisma.plcCharge.deleteMany({});
  await prisma.accountMaster.deleteMany({});
  await prisma.masterCity.deleteMany({});
  await prisma.masterState.deleteMany({});
  await prisma.propertyCategory.deleteMany({});
  console.log('   ✓ Schemes, plots, plot types, PLC charges, masters');

  await prisma.propertyCommissionSlab.deleteMany({});
  await prisma.incomePlan.deleteMany({});
  await prisma.appVersion.deleteMany({});
  await prisma.brandingAsset.deleteMany({});
  await prisma.package.deleteMany({});
  console.log('   ✓ Commission slabs, income plans, packages, app versions');

  await prisma.admin.deleteMany({});
  await prisma.adminRole.deleteMany({});
  console.log('   ✓ Admins, admin roles');

  console.log('\n✅ Database is now empty.\n');
}

async function main() {
  try {
    await resetDatabase();
    await prisma.$disconnect();

    console.log('🌱 Step 1/2 — Running seed.js (base data)...\n');
    execSync('node prisma/seed.js', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    console.log('\n🌱 Step 2/2 — Running seed-dummy.js (sample data)...\n');
    execSync('node prisma/seed-dummy.js', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    console.log('\n🎉 Reset + seed complete!');
  } catch (err) {
    console.error('\n❌ Reset failed:', err.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
