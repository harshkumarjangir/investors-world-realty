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

  // ─── Sample Properties ──────────────────────────────────────────────────────────
  const property1 = await prisma.property.upsert({
    where: { id: 'prop-001' },
    update: {},
    create: {
      id: 'prop-001',
      name: 'Green Valley Phase 1',
      description: 'Premium residential plots in a gated community with all modern amenities',
      location: 'NH-48, Jaipur Road',
      city: 'Jaipur',
      state: 'Rajasthan',
      area: 5000,
      price: 2500,
      type: 'Plot',
      amenities: ['Gated Community', 'Park', '24/7 Security', 'Water Supply', 'Electricity'],
      status: 'AVAILABLE',
      isFeatured: true,
    },
  });

  const property2 = await prisma.property.upsert({
    where: { id: 'prop-002' },
    update: {},
    create: {
      id: 'prop-002',
      name: 'Royal Enclave',
      description: 'Farmhouse plots surrounded by lush greenery, ideal for weekend getaways',
      location: 'Ajmer Highway, Kishangarh',
      city: 'Ajmer',
      state: 'Rajasthan',
      area: 10000,
      price: 1800,
      type: 'Farmhouse',
      amenities: ['Garden', 'Swimming Pool', 'Club House', 'Temple', 'Children Park'],
      status: 'AVAILABLE',
      isFeatured: true,
    },
  });

  const property3 = await prisma.property.upsert({
    where: { id: 'prop-003' },
    update: {},
    create: {
      id: 'prop-003',
      name: 'IWR Commercial Hub',
      description: 'Commercial plots in prime business area with excellent connectivity',
      location: 'Sitapura Industrial Area',
      city: 'Jaipur',
      state: 'Rajasthan',
      area: 3000,
      price: 5000,
      type: 'Commercial',
      amenities: ['Wide Roads', 'CCTV', 'Fire Safety', 'Parking', 'Power Backup'],
      status: 'AVAILABLE',
      isFeatured: false,
    },
  });

  console.log('✅ Sample properties seeded');

  // ─── Sample Associates (for testing bookings) ─────────────────────────────────
  const assocPassword = await bcrypt.hash('Test@1234', 12);

  const assoc1 = await prisma.associate.upsert({
    where: { userId: 'IW100001' },
    update: {},
    create: {
      userId: 'IW100001',
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      phone: '9999900001',
      password: assocPassword,
      status: 'ACTIVE',
      rank: 3,
      totalAreaSold: 1200,
      address: '45, Sector 12, Malviya Nagar',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302017',
      panNumber: 'ABCDE1234F',
      activationDate: new Date('2024-06-15'),
      joiningDate: new Date('2024-06-10'),
    },
  });

  const assoc2 = await prisma.associate.upsert({
    where: { userId: 'IW100002' },
    update: {},
    create: {
      userId: 'IW100002',
      name: 'Suresh Sharma',
      email: 'suresh@example.com',
      phone: '9999900002',
      password: assocPassword,
      status: 'ACTIVE',
      rank: 2,
      totalAreaSold: 800,
      sponsorId: assoc1.id,
      address: '22, Gandhi Nagar',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302015',
      panNumber: 'FGHIJ5678K',
      activationDate: new Date('2024-07-20'),
      joiningDate: new Date('2024-07-15'),
    },
  });

  const assoc3 = await prisma.associate.upsert({
    where: { userId: 'IW100003' },
    update: {},
    create: {
      userId: 'IW100003',
      name: 'Priya Verma',
      email: 'priya@example.com',
      phone: '9999900003',
      password: assocPassword,
      status: 'ACTIVE',
      rank: 1,
      totalAreaSold: 500,
      sponsorId: assoc1.id,
      address: '78, Vaishali Nagar',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302021',
      panNumber: 'KLMNO9012P',
      activationDate: new Date('2024-08-10'),
      joiningDate: new Date('2024-08-05'),
    },
  });

  const assoc4 = await prisma.associate.upsert({
    where: { userId: 'IW100004' },
    update: {},
    create: {
      userId: 'IW100004',
      name: 'Amit Patel',
      email: 'amit@example.com',
      phone: '9999900004',
      password: assocPassword,
      status: 'ACTIVE',
      rank: 1,
      totalAreaSold: 300,
      sponsorId: assoc2.id,
      address: '11, Mansarovar',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302020',
      panNumber: 'PQRST3456U',
      activationDate: new Date('2024-09-01'),
      joiningDate: new Date('2024-08-25'),
    },
  });

  const assoc5 = await prisma.associate.upsert({
    where: { userId: 'IW100005' },
    update: {},
    create: {
      userId: 'IW100005',
      name: 'Kavita Joshi',
      email: 'kavita@example.com',
      phone: '9999900005',
      password: assocPassword,
      status: 'INACTIVE',
      rank: 1,
      totalAreaSold: 0,
      sponsorId: assoc2.id,
      address: '33, Tonk Road',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302018',
      panNumber: 'UVWXY7890Z',
      joiningDate: new Date('2025-01-10'),
    },
  });

  console.log('✅ Sample associates seeded (IW100001 - IW100005)');

  // ─── Wallets for active associates ─────────────────────────────────────────────
  for (const assoc of [assoc1, assoc2, assoc3, assoc4]) {
    await prisma.wallet.upsert({
      where: { associateId: assoc.id },
      update: {},
      create: {
        associateId: assoc.id,
        balance: Math.floor(Math.random() * 50000) + 5000,
        totalCredits: Math.floor(Math.random() * 80000) + 10000,
        totalDebits: Math.floor(Math.random() * 30000) + 2000,
      },
    });
  }

  console.log('✅ Wallets seeded');

  // ─── Tree Nodes (Binary Tree) ──────────────────────────────────────────────────
  const treeNode1 = await prisma.treeNode.upsert({
    where: { associateId: assoc1.id },
    update: {},
    create: {
      associateId: assoc1.id,
      position: 'LEFT',
      level: 0,
      leftVolume: 25000,
      rightVolume: 18000,
    },
  });

  const treeNode2 = await prisma.treeNode.upsert({
    where: { associateId: assoc2.id },
    update: {},
    create: {
      associateId: assoc2.id,
      parentId: treeNode1.id,
      position: 'LEFT',
      level: 1,
      leftVolume: 12000,
      rightVolume: 8000,
    },
  });

  const treeNode3 = await prisma.treeNode.upsert({
    where: { associateId: assoc3.id },
    update: {},
    create: {
      associateId: assoc3.id,
      parentId: treeNode1.id,
      position: 'RIGHT',
      level: 1,
      leftVolume: 5000,
      rightVolume: 3000,
    },
  });

  const treeNode4 = await prisma.treeNode.upsert({
    where: { associateId: assoc4.id },
    update: {},
    create: {
      associateId: assoc4.id,
      parentId: treeNode2.id,
      position: 'LEFT',
      level: 2,
      leftVolume: 0,
      rightVolume: 0,
    },
  });

  // Update parent node child references
  await prisma.treeNode.update({
    where: { id: treeNode1.id },
    data: { leftChildId: treeNode2.id, rightChildId: treeNode3.id },
  });
  await prisma.treeNode.update({
    where: { id: treeNode2.id },
    data: { leftChildId: treeNode4.id },
  });

  console.log('✅ Tree nodes seeded (binary tree)');

  // ─── Sample Plot Bookings ──────────────────────────────────────────────────────
  // Confirmed bookings (with receipts)
  await prisma.booking.upsert({
    where: { id: 'booking-001' },
    update: {},
    create: {
      id: 'booking-001',
      associateId: assoc1.id,
      propertyId: property1.id,
      customerName: 'Ramesh Gupta',
      customerMobile: '9876543210',
      customerAddress: '12, Civil Lines, Jaipur',
      plotNo: '46',
      siteNo: 'A-12',
      plotArea: 200,
      costPerUnit: 2500,
      chargeOfPlot: 5000,
      discount: 0,
      totalBCV: 500000,
      totalCost: 505000,
      amount: 100000,
      modeOfPayment: 'Online',
      chequeNo: null,
      paymentDate: new Date('2025-05-15'),
      bankName: 'HDFC Bank',
      drawnOn: null,
      emiMode: 'Monthly',
      receiptNo: 'REC000001',
      status: 'CONFIRMED',
    },
  });

  await prisma.booking.upsert({
    where: { id: 'booking-002' },
    update: {},
    create: {
      id: 'booking-002',
      associateId: assoc2.id,
      propertyId: property2.id,
      customerName: 'Deepak Chauhan',
      customerMobile: '9876543211',
      customerAddress: '56, Tonk Road, Jaipur',
      plotNo: '78',
      siteNo: 'B-05',
      plotArea: 500,
      costPerUnit: 1800,
      chargeOfPlot: 10000,
      discount: 5000,
      totalBCV: 900000,
      totalCost: 905000,
      amount: 200000,
      modeOfPayment: 'Cheque',
      chequeNo: 'CHQ123456',
      paymentDate: new Date('2025-04-20'),
      bankName: 'State Bank of India',
      drawnOn: new Date('2025-04-20'),
      emiMode: 'Quarterly',
      receiptNo: 'REC000002',
      status: 'CONFIRMED',
    },
  });

  await prisma.booking.upsert({
    where: { id: 'booking-003' },
    update: {},
    create: {
      id: 'booking-003',
      associateId: assoc3.id,
      propertyId: property1.id,
      customerName: 'Sunita Devi',
      customerMobile: '9876543212',
      customerAddress: '89, Mansarovar, Jaipur',
      plotNo: '52',
      siteNo: 'A-18',
      plotArea: 150,
      costPerUnit: 2500,
      chargeOfPlot: 3000,
      discount: 2000,
      totalBCV: 375000,
      totalCost: 376000,
      amount: 75000,
      modeOfPayment: 'UPI',
      chequeNo: 'UPI-REF-789',
      paymentDate: new Date('2025-03-10'),
      bankName: 'ICICI Bank',
      drawnOn: null,
      emiMode: 'Monthly',
      receiptNo: 'REC000003',
      status: 'CONFIRMED',
    },
  });

  // Pending bookings (unapproved)
  await prisma.booking.upsert({
    where: { id: 'booking-004' },
    update: {},
    create: {
      id: 'booking-004',
      associateId: assoc4.id,
      propertyId: property3.id,
      customerName: 'Vikram Singh',
      customerMobile: '9876543213',
      customerAddress: '23, Sitapura, Jaipur',
      plotNo: '15',
      siteNo: 'C-03',
      plotArea: 100,
      costPerUnit: 5000,
      chargeOfPlot: 8000,
      discount: 0,
      totalBCV: 500000,
      totalCost: 508000,
      amount: 150000,
      modeOfPayment: 'NEFT',
      chequeNo: 'NEFT-REF-456',
      paymentDate: new Date('2025-05-28'),
      bankName: 'Axis Bank',
      drawnOn: null,
      emiMode: 'Half Yearly',
      status: 'PENDING',
    },
  });

  await prisma.booking.upsert({
    where: { id: 'booking-005' },
    update: {},
    create: {
      id: 'booking-005',
      associateId: assoc1.id,
      propertyId: property2.id,
      customerName: 'Anita Bose',
      customerMobile: '9876543214',
      customerAddress: '67, Vaishali Nagar, Jaipur',
      plotNo: '91',
      siteNo: 'B-11',
      plotArea: 300,
      costPerUnit: 1800,
      chargeOfPlot: 6000,
      discount: 3000,
      totalBCV: 540000,
      totalCost: 543000,
      amount: 100000,
      modeOfPayment: 'Cash',
      chequeNo: null,
      paymentDate: new Date('2025-06-01'),
      bankName: null,
      drawnOn: null,
      emiMode: 'Monthly',
      status: 'PENDING',
    },
  });

  await prisma.booking.upsert({
    where: { id: 'booking-006' },
    update: {},
    create: {
      id: 'booking-006',
      associateId: assoc2.id,
      propertyId: property1.id,
      customerName: 'Ritu Saxena',
      customerMobile: '9876543215',
      customerAddress: '44, Malviya Nagar, Jaipur',
      plotNo: '33',
      siteNo: 'A-07',
      plotArea: 250,
      costPerUnit: 2500,
      chargeOfPlot: 4000,
      discount: 1000,
      totalBCV: 625000,
      totalCost: 628000,
      amount: 125000,
      modeOfPayment: 'Online',
      chequeNo: 'TXN-987654',
      paymentDate: new Date('2025-06-02'),
      bankName: 'Punjab National Bank',
      drawnOn: null,
      emiMode: 'Monthly',
      status: 'PENDING',
    },
  });

  console.log('✅ Sample plot bookings seeded (3 confirmed + 3 pending)');

  // ─── Sample Wallet Transactions ─────────────────────────────────────────────────
  const wallet1 = await prisma.wallet.findUnique({ where: { associateId: assoc1.id } });
  if (wallet1) {
    const txTypes = [
      { type: 'FUND_TRANSFER_OUT', amount: 3254, desc: 'Fund transfer to IW100002' },
      { type: 'WITHDRAWAL', amount: 4638, desc: 'Withdrawal request' },
      { type: 'ADMIN_CREDIT', amount: 2466, desc: 'Admin bonus credit' },
      { type: 'FUND_TRANSFER_OUT', amount: 4935, desc: 'Fund transfer to IW100003' },
      { type: 'DIRECT_INCOME', amount: 2307, desc: 'Direct income from IW100004 sale' },
      { type: 'FUND_TRANSFER_OUT', amount: 3327, desc: 'Fund transfer to IW100002' },
      { type: 'ADMIN_CREDIT', amount: 2992, desc: 'Festival bonus' },
      { type: 'LEVEL_INCOME', amount: 3450, desc: 'Level income - Level 2' },
      { type: 'FUND_TRANSFER_IN', amount: 127, desc: 'Fund received from IW100004' },
      { type: 'ADMIN_CREDIT', amount: 1738, desc: 'Promotion reward' },
    ];

    let balance = Number(wallet1.balance);
    for (let i = 0; i < txTypes.length; i++) {
      const tx = txTypes[i];
      const isCredit = ['DIRECT_INCOME', 'LEVEL_INCOME', 'ADMIN_CREDIT', 'FUND_TRANSFER_IN'].includes(tx.type);
      if (isCredit) balance += tx.amount; else balance -= tx.amount;

      await prisma.transaction.create({
        data: {
          walletId: wallet1.id,
          type: tx.type,
          amount: tx.amount,
          balanceAfter: Math.max(0, balance),
          description: tx.desc,
          status: 'COMPLETED',
          createdAt: new Date(Date.now() - (i * 15 * 24 * 60 * 60 * 1000)), // spread over ~5 months
        },
      });
    }
  }

  console.log('✅ Sample wallet transactions seeded');

  console.log('\n🎉 Database seeding complete!');
  console.log('⚠️  Remember to change the default admin password after first login.');
  console.log('\n📋 Test Credentials:');
  console.log('   Admin: notespoint2023@gmail.com / Admin@123456');
  console.log('   Associates: IW100001 - IW100005 / Test@1234');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
