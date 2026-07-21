import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomPhone() {
  const prefixes = ['6', '7', '8', '9'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  let num = prefix;
  for (let i = 0; i < 9; i++) num += Math.floor(Math.random() * 10);
  return num;
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

const indianNames = [
  'Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Neha Gupta', 'Vikram Singh',
  'Anjali Verma', 'Rajesh Yadav', 'Pooja Mishra', 'Suresh Reddy', 'Kavita Joshi',
  'Deepak Chauhan', 'Sunita Agarwal', 'Manoj Tiwari', 'Ritu Saxena', 'Arun Nair',
  'Meena Iyer', 'Sanjay Dubey', 'Rekha Pandey', 'Vivek Mehta', 'Anita Bose',
  'Kiran Desai', 'Rohit Malhotra', 'Swati Kapoor', 'Nitin Jain', 'Divya Sinha',
  'Ashok Pillai', 'Geeta Rao', 'Pankaj Bhatt', 'Shweta Kulkarni', 'Manish Thakur',
];

const cities = [
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Delhi', state: 'Delhi' },
  { city: 'Bangalore', state: 'Karnataka' },
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Chennai', state: 'Tamil Nadu' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Jaipur', state: 'Rajasthan' },
  { city: 'Lucknow', state: 'Uttar Pradesh' },
  { city: 'Noida', state: 'Uttar Pradesh' },
  { city: 'Gurgaon', state: 'Haryana' },
];

const propertyNames = [
  'Green Valley Villas', 'Sunrise Apartments', 'Royal Heights', 'Palm Residency',
  'Lake View Plots', 'Metro Heights', 'Garden City Homes', 'Skyline Towers',
  'Emerald Bay', 'Golden Acres', 'Silver Oaks', 'Diamond Plaza',
  'Crystal Gardens', 'Sapphire Residency', 'Pearl Heights',
];

const amenitiesList = [
  'Swimming Pool', 'Gym', 'Clubhouse', 'Park', '24/7 Security',
  'Power Backup', 'Parking', 'Children Play Area', 'Jogging Track',
  'Tennis Court', 'Yoga Room', 'Library', 'Shopping Complex',
];

async function main() {
  console.log('🌱 Seeding dummy data...\n');

  // ─── Clean existing dummy data ─────────────────────────────────────────────
  console.log('Cleaning existing data...');
  await prisma.ticketMessage.deleteMany({});
  await prisma.supportTicket.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.propertyInquiry.deleteMany({});
  await prisma.contactInquiry.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.incomeRecord.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.withdrawalRequest.deleteMany({});
  await prisma.kYCDocument.deleteMany({});
  await prisma.deviceToken.deleteMany({});
  await prisma.propertyImage.deleteMany({});
  await prisma.propertyVideo.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.schemeImage.deleteMany({});
  await prisma.scheme.deleteMany({});
  // Only delete dummy associates (IWR100011+), preserving rank-ladder IWR100001–IWR100010
  const dummyAssociates = await prisma.associate.findMany({
    where: { userId: { gte: 'IWR100011' } },
    select: { id: true },
  });
  const dummyIds = dummyAssociates.map((a) => a.id);
  if (dummyIds.length > 0) {
    await prisma.treeNode.updateMany({ where: { associateId: { in: dummyIds } }, data: { leftChildId: null, rightChildId: null, parentId: null } });
    await prisma.treeNode.deleteMany({ where: { associateId: { in: dummyIds } } });
    await prisma.wallet.deleteMany({ where: { associateId: { in: dummyIds } } });
    await prisma.associate.deleteMany({ where: { id: { in: dummyIds } } });
  } else {
    await prisma.wallet.deleteMany({ where: { associateId: { notIn: [] } } });
  }
  await prisma.payout.deleteMany({});
  console.log('  ✅ Cleaned\n');

  const hashedPassword = await bcrypt.hash('Test@1234', 12);


  // ─── Create Root Associate (Sponsor for all) ───────────────────────────────
  console.log('Looking up root sponsor IWR100010 (President Club)...');
  const rootAssociate = await prisma.associate.findUnique({ where: { userId: 'IWR100010' } });
  if (!rootAssociate) {
    console.error('❌ IWR100010 not found. Run: npm run db:seed first.');
    process.exit(1);
  }
  console.log(`  ✅ Root: ${rootAssociate.userId} (${rootAssociate.name}) — rank ${rootAssociate.rank}`);

  // ─── Create 29 More Associates ─────────────────────────────────────────────
  console.log('\nCreating 20 dummy associates (IWR100011–IWR100030)...');
  const associates = [rootAssociate];
  const rootTreeNode = await prisma.treeNode.findUnique({ where: { associateId: rootAssociate.id } });
  const treeNodes = [rootTreeNode];

  for (let i = 1; i <= 20; i++) {
    const userId = `IW${String(100010 + i).padStart(6, '0')}`;
    const name = indianNames[i % indianNames.length];
    const loc = cities[i % cities.length];
    const status = i <= 20 ? 'ACTIVE' : (i <= 25 ? 'INACTIVE' : 'SUSPENDED');
    const joiningDate = randomDate(new Date('2024-02-01'), new Date('2025-04-01'));

    const associate = await prisma.associate.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        name,
        email: `${name.split(' ')[0].toLowerCase()}${i}@example.com`,
        phone: randomPhone(),
        password: hashedPassword,
        address: `${100 + i} Sector ${i + 10}`,
        city: loc.city,
        state: loc.state,
        pincode: `${400000 + i * 11}`,
        panNumber: `${String.fromCharCode(65 + (i % 26))}BCDE${1000 + i}${String.fromCharCode(70 + (i % 6))}`,

        sponsorId: rootAssociate.id,
        status,
        joiningDate,
        activationDate: status === 'ACTIVE' ? new Date(joiningDate.getTime() + 86400000) : null,
      },
    });

    // BFS placement: find parent node that has an open slot
    const position = i % 2 === 0 ? 'LEFT' : 'RIGHT';
    let parentNode = null;

    // Find first node with an open slot in the preferred position
    for (const tn of treeNodes) {
      if (position === 'LEFT' && !tn.leftChildId) { parentNode = tn; break; }
      if (position === 'RIGHT' && !tn.rightChildId) { parentNode = tn; break; }
    }
    // Fallback: find any node with any open slot
    if (!parentNode) {
      for (const tn of treeNodes) {
        if (!tn.leftChildId || !tn.rightChildId) { parentNode = tn; break; }
      }
    }

    const actualPosition = parentNode && !parentNode.leftChildId ? 'LEFT' : 'RIGHT';

    const treeNode = await prisma.treeNode.upsert({
      where: { associateId: associate.id },
      update: {},
      create: {
        associateId: associate.id,
        parentId: parentNode.id,
        position: actualPosition,
        level: parentNode.level + 1,
        leftVolume: Math.floor(Math.random() * 100000),
        rightVolume: Math.floor(Math.random() * 100000),
      },
    });

    // Update parent's leftChildId or rightChildId
    if (actualPosition === 'LEFT') {
      await prisma.treeNode.update({ where: { id: parentNode.id }, data: { leftChildId: treeNode.id } });
      parentNode.leftChildId = treeNode.id;
    } else {
      await prisma.treeNode.update({ where: { id: parentNode.id }, data: { rightChildId: treeNode.id } });
      parentNode.rightChildId = treeNode.id;
    }

    treeNodes.push(treeNode);

    // Wallet
    const credits = Math.floor(Math.random() * 50000) + 5000;
    const debits = Math.floor(Math.random() * credits * 0.5);
    await prisma.wallet.upsert({
      where: { associateId: associate.id },
      update: {},
      create: {
        associateId: associate.id,
        balance: credits - debits,
        totalCredits: credits,
        totalDebits: debits,
      },
    });

    associates.push(associate);
    if (i % 10 === 0) console.log(`  ✅ Created ${i}/29 associates`);
  }
  console.log(`  ✅ All 20 dummy associates created (IWR100011–IWR100030)`);

  // ─── Create Income Records ─────────────────────────────────────────────────
  console.log('\nCreating income records...');
  const incomeTypes = ['DIRECT', 'LEVEL', 'MATCHING', 'REWARD'];
  const incomeStatuses = ['PENDING', 'APPROVED', 'PAID'];

  for (let i = 0; i < 50; i++) {
    const assoc = associates[Math.floor(Math.random() * 20)]; // only active ones
    await prisma.incomeRecord.create({
      data: {
        associateId: assoc.id,
        type: incomeTypes[Math.floor(Math.random() * incomeTypes.length)],
        amount: Math.floor(Math.random() * 10000) + 500,
        sourceId: associates[Math.floor(Math.random() * associates.length)].id,
        status: incomeStatuses[Math.floor(Math.random() * incomeStatuses.length)],
        createdAt: randomDate(new Date('2024-03-01'), new Date()),
      },
    });
  }
  console.log('  ✅ 50 income records created');

  // ─── Create Schemes ────────────────────────────────────────────────────────
  console.log('\nCreating dummy schemes...');
  const schemes = [];
  const schemeNames = ['Royal Enclave', 'Green Meadows', 'Sunrise Heights', 'Palm County'];
  for (let i = 0; i < schemeNames.length; i++) {
    const loc = cities[i % cities.length];
    const scheme = await prisma.scheme.create({
      data: {
        schemeName: schemeNames[i],
        state: loc.state,
        city: loc.city,
        address: `${500 + i * 20} Royal Boulevard, ${loc.city}`,
        pinCode: `${302001 + i}`,
        schemeType: i % 2 === 0 ? 'Residential' : 'Commercial',
        featuredScheme: i === 0,
        description: `Premium development project ${schemeNames[i]} located in prime location of ${loc.city} with modern facilities.`,
        shortDescription: `Beautiful ${schemeNames[i]} project in ${loc.city}.`,
      },
    });
    schemes.push(scheme);
  }
  console.log(`  ✅ ${schemes.length} schemes created`);

  // ─── Create Properties ─────────────────────────────────────────────────────
  console.log('\nCreating properties...');
  const propertyTypes = ['Villa', 'Apartment', 'Plot', 'Commercial', 'Farmhouse'];
  const propertyStatuses = ['AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'BOOKED', 'SOLD'];

  for (let i = 0; i < 15; i++) {
    const loc = cities[i % cities.length];
    const randomAmenities = amenitiesList
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 6) + 3);
    const scheme = schemes[i % schemes.length];

    await prisma.property.create({
      data: {
        schemeId: scheme.id,
        name: propertyNames[i],
        description: `Premium ${propertyTypes[i % propertyTypes.length].toLowerCase()} project in ${loc.city}. Features modern amenities, excellent connectivity, and premium finishes. Ideal for investment and living.`,
        location: `Sector ${10 + i * 3}, ${loc.city}`,
        city: loc.city,
        state: loc.state,
        area: Math.floor(Math.random() * 3000) + 800,
        price: (Math.floor(Math.random() * 90) + 10) * 100000,
        type: propertyTypes[i % propertyTypes.length],
        amenities: randomAmenities,
        status: propertyStatuses[i % propertyStatuses.length],
        isFeatured: i < 4,
        createdAt: randomDate(new Date('2024-06-01'), new Date()),
      },
    });
  }
  console.log('  ✅ 15 properties created');

  // ─── Create Transactions ───────────────────────────────────────────────────
  console.log('\nCreating wallet transactions...');
  const txTypes = ['DIRECT_INCOME', 'LEVEL_INCOME', 'FUND_TRANSFER_IN', 'FUND_TRANSFER_OUT', 'ADMIN_CREDIT', 'WITHDRAWAL'];

  for (let i = 0; i < 40; i++) {
    const assoc = associates[Math.floor(Math.random() * 20)];
    const wallet = await prisma.wallet.findUnique({ where: { associateId: assoc.id } });
    if (!wallet) continue;

    await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: txTypes[Math.floor(Math.random() * txTypes.length)],
        amount: Math.floor(Math.random() * 5000) + 100,
        balanceAfter: Number(wallet.balance),
        description: `Transaction #${i + 1}`,
        reference: associates[Math.floor(Math.random() * associates.length)].userId,
        status: 'COMPLETED',
        createdAt: randomDate(new Date('2024-04-01'), new Date()),
      },
    });
  }
  console.log('  ✅ 40 transactions created');

  // ─── Create Withdrawal Requests ────────────────────────────────────────────
  console.log('\nCreating withdrawal requests...');
  const wdStatuses = ['PENDING', 'PENDING', 'APPROVED', 'REJECTED', 'PAID'];

  for (let i = 0; i < 10; i++) {
    const assoc = associates[Math.floor(Math.random() * 20)];
    await prisma.withdrawalRequest.create({
      data: {
        associateId: assoc.id,
        amount: Math.floor(Math.random() * 10000) + 1000,
        status: wdStatuses[Math.floor(Math.random() * wdStatuses.length)],
        createdAt: randomDate(new Date('2024-06-01'), new Date()),
      },
    });
  }
  console.log('  ✅ 10 withdrawal requests created');

  // ─── Create Support Tickets ────────────────────────────────────────────────
  console.log('\nCreating support tickets...');
  const ticketSubjects = [
    'Cannot login to my account',
    'Withdrawal not processed',
    'KYC document rejected incorrectly',
    'Commission not credited',
    'Need help with registration',
    'Property booking issue',
    'App crashing on dashboard',
    'Wrong amount credited',
  ];

  for (let i = 0; i < 8; i++) {
    const assoc = associates[Math.floor(Math.random() * 20)];
    const statuses = ['OPEN', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    const ticketNum = `TKT-${String(i + 1).padStart(6, '0')}`;

    await prisma.supportTicket.create({
      data: {
        ticketNumber: ticketNum,
        associateId: assoc.id,
        subject: ticketSubjects[i],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        messages: {
          create: {
            senderId: assoc.id,
            senderType: 'associate',
            message: `Hi, I need help with: ${ticketSubjects[i]}. Please assist me as soon as possible.`,
          },
        },
      },
    });
  }
  console.log('  ✅ 8 support tickets created');

  // ─── Create Notifications ──────────────────────────────────────────────────
  console.log('\nCreating notifications...');
  const notifTypes = ['PAYOUT', 'REGISTRATION', 'PROPERTY', 'ANNOUNCEMENT', 'INCOME', 'KYC', 'SYSTEM'];
  const notifMessages = [
    { title: 'Payout Approved', message: 'Your payout of ₹5,000 has been approved.' },
    { title: 'New Team Member', message: 'A new associate has joined under your sponsorship.' },
    { title: 'New Property Listed', message: 'Check out our new property: Green Valley Villas.' },
    { title: 'Platform Update', message: 'We have updated our commission structure. Check the income plan.' },
    { title: 'Income Credited', message: 'You earned ₹2,500 as Level Income.' },
    { title: 'KYC Approved', message: 'Your PAN card verification is complete.' },
    { title: 'Maintenance Notice', message: 'Scheduled maintenance on Sunday 2 AM - 4 AM.' },
  ];

  for (let i = 0; i < 20; i++) {
    const assoc = associates[Math.floor(Math.random() * 20)];
    const notif = notifMessages[Math.floor(Math.random() * notifMessages.length)];

    await prisma.notification.create({
      data: {
        associateId: assoc.id,
        title: notif.title,
        message: notif.message,
        type: notifTypes[Math.floor(Math.random() * notifTypes.length)],
        isRead: Math.random() > 0.5,
        createdAt: randomDate(new Date('2024-08-01'), new Date()),
      },
    });
  }
  console.log('  ✅ 20 notifications created');

  // ─── Create Contact Inquiries ──────────────────────────────────────────────
  console.log('\nCreating contact inquiries...');
  for (let i = 0; i < 5; i++) {
    await prisma.contactInquiry.create({
      data: {
        name: indianNames[i + 10],
        email: `visitor${i + 1}@gmail.com`,
        phone: randomPhone(),
        message: `I am interested in learning more about your investment plans. Please contact me. Inquiry #${i + 1}`,
        createdAt: randomDate(new Date('2024-10-01'), new Date()),
      },
    });
  }
  console.log('  ✅ 5 contact inquiries created');

  // ─── Create KYC Documents ──────────────────────────────────────────────────
  console.log('\nCreating KYC documents...');
  const kycStatuses = ['PENDING', 'PENDING', 'APPROVED', 'REJECTED'];

  for (let i = 0; i < 15; i++) {
    const assoc = associates[i + 1]; // skip root
    const types = ['PAN', 'AADHAAR', 'BANK'];
    const type = types[i % 3];

    await prisma.kYCDocument.upsert({
      where: { associateId_type: { associateId: assoc.id, type } },
      update: {},
      create: {
        associateId: assoc.id,
        type,
        documentNumber: type === 'PAN' ? `ABCDE${1000 + i}F` : type === 'AADHAAR' ? `${100000000000 + i}` : JSON.stringify({ accountNumber: `${1234567890 + i}`, ifsc: 'SBIN0001234', bankName: 'State Bank of India' }),
        documentUrl: type === 'BANK' ? '' : `uploads/kyc/dummy-${type.toLowerCase()}-${i}.jpg`,
        status: kycStatuses[Math.floor(Math.random() * kycStatuses.length)],
      },
    });
  }
  console.log('  ✅ 15 KYC documents created');

  // ─── Summary ───────────────────────────────────────────────────────────────
  console.log('\n🎉 Dummy data seeding complete!');
  console.log('─────────────────────────────────────────');
  console.log('  20 Dummy Associates IWR100011–IWR100030 (+ 10 rank-ladder from seed.js)');
  console.log('  50 Income Records');
  console.log('  15 Properties (4 featured)');
  console.log('  40 Wallet Transactions');
  console.log('  10 Withdrawal Requests');
  console.log('  8 Support Tickets');
  console.log('  20 Notifications');
  console.log('  5 Contact Inquiries');
  console.log('  15 KYC Documents');
  console.log('─────────────────────────────────────────');
  console.log('\n📋 Login credentials for all associates:');
  console.log('  Password: Test@1234');
  console.log('  Rank Ladder: IWR100001–IWR100010 (seed.js) | Dummy: IWR100011–IWR100030');
  console.log('\n📋 Admin login:');
  console.log('  Email: admin@investorsworld.com');
  console.log('  Password: Admin@123456');
}

main()
  .catch((e) => { console.error('❌ Dummy seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
