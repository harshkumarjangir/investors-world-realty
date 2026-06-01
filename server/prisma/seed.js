import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Admin Roles ─────────────────────────────────────────────────────────────
  const superAdminRole = await prisma.adminRole.upsert({
    where: { name: 'Super Admin' },
    update: {},
    create: {
      name: 'Super Admin',
      permissions: [
        'dashboard:read',
        'associates:read', 'associates:write', 'associates:delete',
        'genealogy:read',
        'payouts:read', 'payouts:write',
        'reports:read', 'reports:export',
        'funds:read', 'funds:write',
        'properties:read', 'properties:write', 'properties:delete',
        'notifications:read', 'notifications:write',
        'kyc:read', 'kyc:write',
        'config:read', 'config:write',
        'transactions:read',
        'contact:read',
        'admins:read', 'admins:write',
      ],
    },
  });

  await prisma.adminRole.upsert({
    where: { name: 'Manager' },
    update: {},
    create: {
      name: 'Manager',
      permissions: [
        'dashboard:read',
        'associates:read', 'associates:write',
        'genealogy:read',
        'payouts:read', 'payouts:write',
        'reports:read', 'reports:export',
        'properties:read', 'properties:write',
        'kyc:read', 'kyc:write',
        'transactions:read',
      ],
    },
  });

  await prisma.adminRole.upsert({
    where: { name: 'Support' },
    update: {},
    create: {
      name: 'Support',
      permissions: [
        'dashboard:read',
        'associates:read',
        'kyc:read', 'kyc:write',
        'contact:read',
        'transactions:read',
      ],
    },
  });

  await prisma.adminRole.upsert({
    where: { name: 'Accounts' },
    update: {},
    create: {
      name: 'Accounts',
      permissions: [
        'dashboard:read',
        'payouts:read', 'payouts:write',
        'reports:read', 'reports:export',
        'funds:read', 'funds:write',
        'transactions:read',
      ],
    },
  });

  console.log('✅ Admin roles seeded');

  // ─── Default Super Admin ──────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('Admin@123456', 12);
  await prisma.admin.upsert({
    where: { email: 'notespoint2023@gmail.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'notespoint2023@gmail.com',
      phone: '9999999999',
      password: hashedPassword,
      roleId: superAdminRole.id,
    },
  });

  console.log('✅ Default super admin seeded (email: notespoint2023@gmail.com, password: Admin@123456)');

  // ─── Default Package ──────────────────────────────────────────────────────────
  await prisma.package.upsert({
    where: { id: 'default-package-001' },
    update: {},
    create: {
      id: 'default-package-001',
      name: 'Starter Package',
      price: 5000,
      benefits: ['Binary tree placement', 'Direct income eligibility', 'Level income up to 5 levels'],
      directPercent: 10,
      isActive: true,
    },
  });

  console.log('✅ Default package seeded');

  // ─── Income Plans ─────────────────────────────────────────────────────────────
  await prisma.incomePlan.upsert({
    where: { id: 'plan-direct-001' },
    update: {},
    create: { id: 'plan-direct-001', type: 'DIRECT', percentage: 10, isActive: true },
  });

  const levelPercentages = [5, 3, 2, 1, 1];
  for (let i = 0; i < levelPercentages.length; i++) {
    const level = i + 1;
    await prisma.incomePlan.upsert({
      where: { id: `plan-level-00${level}` },
      update: {},
      create: { id: `plan-level-00${level}`, type: 'LEVEL', level, percentage: levelPercentages[i], isActive: true },
    });
  }

  await prisma.incomePlan.upsert({
    where: { id: 'plan-matching-001' },
    update: {},
    create: { id: 'plan-matching-001', type: 'MATCHING', percentage: 10, minPairVolume: 1000, isActive: true },
  });

  const rewardMilestones = [
    { id: 'plan-reward-001', milestone: 50000, rewardAmount: 5000 },
    { id: 'plan-reward-002', milestone: 100000, rewardAmount: 15000 },
    { id: 'plan-reward-003', milestone: 500000, rewardAmount: 100000 },
  ];
  for (const reward of rewardMilestones) {
    await prisma.incomePlan.upsert({
      where: { id: reward.id },
      update: {},
      create: { id: reward.id, type: 'REWARD', percentage: 0, milestone: reward.milestone, rewardAmount: reward.rewardAmount, isActive: true },
    });
  }

  console.log('✅ Income plans seeded (Direct, Level 1-5, Matching, Reward milestones)');

  // ─── Master States ────────────────────────────────────────────────────────────
  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh',
  ];
  for (const stateName of states) {
    await prisma.masterState.upsert({
      where: { name: stateName },
      update: {},
      create: { name: stateName },
    });
  }
  console.log('✅ Master states seeded');

  // ─── Property Categories ──────────────────────────────────────────────────────
  const categories = ['Villa', 'Plot', 'Apartment', 'Commercial', 'Farmhouse', 'Penthouse'];
  for (const cat of categories) {
    await prisma.propertyCategory.upsert({
      where: { name: cat },
      update: {},
      create: { name: cat },
    });
  }
  console.log('✅ Property categories seeded');

  // ─── App Version defaults ─────────────────────────────────────────────────────
  await prisma.appVersion.upsert({
    where: { id: 'app-version-android' },
    update: {},
    create: {
      id: 'app-version-android',
      platform: 'android',
      minVersion: '1.0.0',
      latestVersion: '1.0.0',
      storeUrl: 'https://play.google.com/store/apps/details?id=com.investorsworld.realty',
      forceUpdate: false,
    },
  });
  await prisma.appVersion.upsert({
    where: { id: 'app-version-ios' },
    update: {},
    create: {
      id: 'app-version-ios',
      platform: 'ios',
      minVersion: '1.0.0',
      latestVersion: '1.0.0',
      storeUrl: 'https://apps.apple.com/app/investors-world-realty/id000000000',
      forceUpdate: false,
    },
  });
  console.log('✅ App version defaults seeded');

  console.log('\n🎉 Database seeding complete!');
  console.log('⚠️  Remember to change the default admin password after first login.');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
