import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Admin Roles ──────────────────────────────────────────────────────────
  const superAdminPermissions = [
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
        'support:read', 'support:write',
        'admins:read', 'admins:write',
  ];

  const superAdminRole = await prisma.adminRole.upsert({
    where: { name: 'Super Admin' },
    update: { permissions: superAdminPermissions },
    create: { name: 'Super Admin', permissions: superAdminPermissions },
  });

  const otherRoles = [
    { name: 'Manager', permissions: ['dashboard:read','associates:read','associates:write','genealogy:read','payouts:read','payouts:write','reports:read','reports:export','properties:read','properties:write','kyc:read','kyc:write','transactions:read','support:read','support:write'] },
    { name: 'Support',  permissions: ['dashboard:read','associates:read','kyc:read','kyc:write','contact:read','transactions:read','support:read','support:write'] },
    { name: 'Accounts', permissions: ['dashboard:read','payouts:read','payouts:write','reports:read','reports:export','funds:read','funds:write','transactions:read'] },
  ];
  for (const role of otherRoles) {
    await prisma.adminRole.upsert({
      where: { name: role.name },
      update: { permissions: role.permissions },
      create: role,
    });
  }
  console.log('✅ Admin roles seeded');

  // ─── Super Admin ──────────────────────────────────────────────────────────
  const adminPass = await bcrypt.hash('Admin@123456', 12);
  await prisma.admin.upsert({
    where: { email: 'admindevelopertest@yopmail.com' },
    update: {},
    create: { name: 'Super Admin', email: 'admindevelopertest@yopmail.com', phone: '9999999999', password: adminPass, roleId: superAdminRole.id },
  });
  console.log('✅ Super admin seeded');

  // ─── Default Package ──────────────────────────────────────────────────────
  await prisma.package.upsert({
    where: { id: 'default-package-001' },
    update: {},
    create: { id: 'default-package-001', name: 'Starter Package', price: 5000, benefits: ['Binary tree placement', 'Direct income eligibility', 'Level income up to 5 levels'], directPercent: 10, isActive: true },
  });
  console.log('✅ Default package seeded');

  // ─── Income Plans ─────────────────────────────────────────────────────────
  await prisma.incomePlan.upsert({ where: { id: 'plan-direct-001' }, update: {}, create: { id: 'plan-direct-001', type: 'DIRECT', percentage: 10, isActive: true } });
  for (const [i, pct] of [5,3,2,1,1].entries()) {
    await prisma.incomePlan.upsert({ where: { id: `plan-level-00${i+1}` }, update: {}, create: { id: `plan-level-00${i+1}`, type: 'LEVEL', level: i+1, percentage: pct, isActive: true } });
  }
  await prisma.incomePlan.upsert({ where: { id: 'plan-matching-001' }, update: {}, create: { id: 'plan-matching-001', type: 'MATCHING', percentage: 10, minPairVolume: 1000, isActive: true } });
  for (const r of [{ id:'plan-reward-001',milestone:50000,rewardAmount:5000},{ id:'plan-reward-002',milestone:100000,rewardAmount:15000},{ id:'plan-reward-003',milestone:500000,rewardAmount:100000}]) {
    await prisma.incomePlan.upsert({ where: { id: r.id }, update: {}, create: { ...r, type: 'REWARD', percentage: 0, isActive: true } });
  }
  console.log('✅ Income plans seeded');

  // ─── Master States ────────────────────────────────────────────────────────
  for (const s of ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh']) {
    await prisma.masterState.upsert({ where: { name: s }, update: {}, create: { name: s } });
  }
  console.log('✅ Master states seeded (31 states)');

  // ─── Property Categories ──────────────────────────────────────────────────
  for (const c of ['Villa','Plot','Apartment','Commercial','Farmhouse','Penthouse']) {
    await prisma.propertyCategory.upsert({ where: { name: c }, update: {}, create: { name: c } });
  }
  console.log('✅ Property categories seeded');

  // ─── App Version ──────────────────────────────────────────────────────────
  await prisma.appVersion.upsert({ where: { id: 'app-version-android' }, update: {}, create: { id: 'app-version-android', platform: 'android', minVersion: '1.0.0', latestVersion: '1.0.0', storeUrl: 'https://play.google.com/store/apps/details?id=com.investorsworld.realty', forceUpdate: false } });
  await prisma.appVersion.upsert({ where: { id: 'app-version-ios' }, update: {}, create: { id: 'app-version-ios', platform: 'ios', minVersion: '1.0.0', latestVersion: '1.0.0', storeUrl: 'https://apps.apple.com/app/investors-world-realty/id000000000', forceUpdate: false } });
  console.log('✅ App versions seeded');

  // ─── Commission Slabs (Gap Model) ────────────────────────────────────────
  for (const s of [
    { id:'slab-001', minArea:0,     maxArea:6000,   sellerPercent:4,   level1Percent:6,    level2Percent:7.5,  level3Percent:9,    level4Percent:10,   level5Percent:11,   level6Percent:12,   level7Percent:13,   level8Percent:14,   level9Percent:2, level10Percent:0 },
    { id:'slab-002', minArea:6001,  maxArea:10000,  sellerPercent:3,   level1Percent:5,    level2Percent:6.5,  level3Percent:8,    level4Percent:9,    level5Percent:10,   level6Percent:11,   level7Percent:12,   level8Percent:13,   level9Percent:2, level10Percent:0 },
    { id:'slab-003', minArea:10001, maxArea:15000,  sellerPercent:2.5, level1Percent:4,    level2Percent:5,    level3Percent:6,    level4Percent:6.8,  level5Percent:7.6,  level6Percent:8.4,  level7Percent:9.2,  level8Percent:10,   level9Percent:2, level10Percent:0 },
    { id:'slab-004', minArea:15001, maxArea:20000,  sellerPercent:2.2, level1Percent:3.2,  level2Percent:4,    level3Percent:4.8,  level4Percent:5.5,  level5Percent:6.2,  level6Percent:6.9,  level7Percent:7.6,  level8Percent:8.3,  level9Percent:2, level10Percent:0 },
    { id:'slab-005', minArea:20001, maxArea:25000,  sellerPercent:1.8, level1Percent:2.7,  level2Percent:3.4,  level3Percent:4.1,  level4Percent:4.8,  level5Percent:5.5,  level6Percent:6.1,  level7Percent:6.7,  level8Percent:7.3,  level9Percent:2, level10Percent:0 },
    { id:'slab-006', minArea:25001, maxArea:30000,  sellerPercent:1.5, level1Percent:2.3,  level2Percent:2.9,  level3Percent:3.5,  level4Percent:4.1,  level5Percent:4.7,  level6Percent:5.2,  level7Percent:5.7,  level8Percent:6.2,  level9Percent:2, level10Percent:0 },
    { id:'slab-007', minArea:30001, maxArea:35000,  sellerPercent:1.3, level1Percent:2,    level2Percent:2.6,  level3Percent:3.2,  level4Percent:3.7,  level5Percent:4.2,  level6Percent:4.7,  level7Percent:5.1,  level8Percent:5.6,  level9Percent:2, level10Percent:0 },
    { id:'slab-008', minArea:35001, maxArea:999999, sellerPercent:1,   level1Percent:1.5,  level2Percent:2,    level3Percent:2.5,  level4Percent:3,    level5Percent:3.5,  level6Percent:4,    level7Percent:4.5,  level8Percent:5,    level9Percent:2, level10Percent:0 },
  ]) {
    await prisma.propertyCommissionSlab.upsert({ where: { id: s.id }, update: {}, create: { ...s, isActive: true } });
  }
  console.log('✅ Commission slabs seeded (8 slabs — matches seed-commission-slabs.js)');

  // ─── PLC Charges ─────────────────────────────────────────────────────────
  for (const p of [
    { id:'plc-001', plcName:'Corner Plot',       chargeType:'Percentage', plcCharge:10 },
    { id:'plc-002', plcName:'Do Not Flat',        chargeType:'Percentage', plcCharge:10 },
    { id:'plc-003', plcName:'East Facing',        chargeType:'Percentage', plcCharge:5  },
    { id:'plc-004', plcName:'Park Facing',        chargeType:'Percentage', plcCharge:8  },
    { id:'plc-005', plcName:'Main Road Facing',   chargeType:'Fixed',      plcCharge:50000 },
  ]) {
    await prisma.plcCharge.upsert({ where: { id: p.id }, update: {}, create: p });
  }
  console.log('✅ PLC charges seeded');

  // ─── Plot Types ───────────────────────────────────────────────────────────
  for (const t of ['PLOT','FLAT','SHOP','VILLA','FARMHOUSE','COMMERCIAL']) {
    await prisma.plotType.upsert({ where: { typeName: t }, update: {}, create: { typeName: t } });
  }
  console.log('✅ Plot types seeded');

  // ─── Account Masters ──────────────────────────────────────────────────────
  await prisma.accountMaster.upsert({
    where: { id: 'acct-001' }, update: {},
    create: { id:'acct-001', accountName:'HDFC Bank - Mansarovar', underGroup:'Bank', address:'P.No.157, Mahaveer Nagar-b, Patrkar Colony Road, Mansarovar', state:'Rajasthan', city:'Jaipur', mobileNo:'9999999999', emailId:'info@investorworld.co.in', phoneNo:'01411234567', gstNo:'08AABCI1234A1Z5', bankAccountNo:'50100123456789', branchName:'Mansarovar Branch', bankIfscCode:'HDFC0001234', type:'Dr' },
  });
  await prisma.accountMaster.upsert({
    where: { id: 'acct-002' }, update: {},
    create: { id:'acct-002', accountName:'SBI - Main Branch', underGroup:'Bank', state:'Rajasthan', city:'Jaipur', bankAccountNo:'10234567890', branchName:'Jaipur Main Branch', bankIfscCode:'SBIN0001234', type:'Cr' },
  });
  console.log('✅ Account masters seeded');

  // ─── Schemes ─────────────────────────────────────────────────────────────
  const scheme1 = await prisma.scheme.upsert({
    where: { id: 'scheme-001' }, update: {},
    create: { id:'scheme-001', schemeName:'Swarn Nagar', state:'Rajasthan', city:'Jaipur', address:'Reed Samastoram, Gerudwali Road, Tonk Road, Chaksu Bypass, Chaksu, Jaipur', pinCode:'303901', schemeType:'Residential', featuredScheme:true, googleMap:'https://maps.google.com/?q=Chaksu+Jaipur', shortDescription:'Investors World Realty Pvt. Ltd. — Premium residential plots in Swarn Nagar.', description:'Swarn Nagar is a flagship project offering premium residential plots with all modern amenities in the growing Chaksu corridor of Jaipur.', isActive:true },
  });
  await prisma.scheme.upsert({
    where: { id: 'scheme-002' }, update: {},
    create: { id:'scheme-002', schemeName:'Veera Residency', state:'Rajasthan', city:'Jaipur', address:'VILL. DUDU, TEH. DUDU, DIST. AJMER ROAD, JAIPUR', pinCode:'303008', schemeType:'Residential', featuredScheme:true, isActive:true },
  });
  console.log('✅ Schemes seeded (Swarn Nagar, Veera Residency)');

  // ─── Sample Plots (Swarn Nagar) ───────────────────────────────────────────
  const plotType = await prisma.plotType.findFirst({ where: { typeName: 'PLOT' } });
  const cornerPlc = await prisma.plcCharge.findFirst({ where: { plcName: 'Corner Plot' } });
  for (const p of [
    { no:'07',  size:181.22 }, { no:'08',  size:152.78 }, { no:'09',  size:152.78 },
    { no:'10',  size:269.9,  corner:true }, { no:'100', size:166.66 },
    { no:'101', size:332.47, corner:true }, { no:'11',  size:269.9,  corner:true },
    { no:'12',  size:152.78 }, { no:'122', size:280.05, corner:true }, { no:'133', size:200 },
  ]) {
    const totalCost = p.size * 2500;
    const charge = p.corner && cornerPlc ? totalCost * (Number(cornerPlc.plcCharge) / 100) : 0;
    await prisma.plot.upsert({
      where: { id: `plot-sn-${p.no}` }, update: {},
      create: { id:`plot-sn-${p.no}`, schemeId:scheme1.id, plotTypeId:plotType?.id||null, plotSizeUnit:'Square Yards', plotSize:p.size, totalCost, plotNo:p.no, plcId:p.corner ? cornerPlc?.id||null : null, chargeOfPlot:charge, totalCostOfPlot:totalCost+charge, status:'Not Used' },
    });
  }
  console.log('✅ Sample plots seeded for Swarn Nagar');

  // ─── Sample Properties ────────────────────────────────────────────────────
  const property1 = await prisma.property.upsert({ where:{id:'prop-001'}, update:{}, create:{id:'prop-001',name:'Green Valley Phase 1',description:'Premium residential plots in a gated community with all modern amenities',location:'NH-48, Jaipur Road',city:'Jaipur',state:'Rajasthan',area:5000,price:2500,type:'Plot',amenities:['Gated Community','Park','24/7 Security','Water Supply','Electricity'],status:'AVAILABLE',isFeatured:true} });
  const property2 = await prisma.property.upsert({ where:{id:'prop-002'}, update:{}, create:{id:'prop-002',name:'Royal Enclave',description:'Farmhouse plots surrounded by lush greenery, ideal for weekend getaways',location:'Ajmer Highway, Kishangarh',city:'Ajmer',state:'Rajasthan',area:10000,price:1800,type:'Farmhouse',amenities:['Garden','Swimming Pool','Club House','Temple','Children Park'],status:'AVAILABLE',isFeatured:true} });
  const property3 = await prisma.property.upsert({ where:{id:'prop-003'}, update:{}, create:{id:'prop-003',name:'IWR Commercial Hub',description:'Commercial plots in prime business area with excellent connectivity',location:'Sitapura Industrial Area',city:'Jaipur',state:'Rajasthan',area:3000,price:5000,type:'Commercial',amenities:['Wide Roads','CCTV','Fire Safety','Parking','Power Backup'],status:'AVAILABLE',isFeatured:false} });
  console.log('✅ Sample properties seeded');

  // ─── Associates ───────────────────────────────────────────────────────────
  const ap = await bcrypt.hash('Test@1234', 12);

  // ─── Full Rank Ladder (one associate per rank 10→1) ───────────────────────
  // Each higher-rank associate sponsors the next one down.
  // This lets you test registration under any rank level.
  //
  // IW100010 = President Club    (rank 10) — root sponsor, unlimited downlines
  // IW100009 = President Sales   (rank 9)
  // IW100008 = Vice President    (rank 8)
  // IW100007 = National BH       (rank 7)
  // IW100006 = Regional BH       (rank 6)
  // IW100005 = State BH          (rank 5)
  // IW100004 = Dist. BH          (rank 4)
  // IW100003 = Business Head     (rank 3)
  // IW100002 = Business Adviser  (rank 2) ← good sponsor to test new registration
  // IW100001 = Business Associate(rank 1) ← cannot sponsor (rank 1 restriction)

  const rankData = [
    { userId:'IW100010', name:'Arjun Singhania',  email:'arjun@example.com',   phone:'9999900010', rank:10, area:15000, pan:'ARJUN1234A', city:'Mumbai',    addr:'1, Sea View, Marine Drive',  join:'2022-01-01', act:'2022-01-05' },
    { userId:'IW100009', name:'Meena Kapoor',     email:'meena@example.com',   phone:'9999900009', rank:9,  area:12000, pan:'MEENA5678B', city:'Delhi',     addr:'9, Green Park, New Delhi',   join:'2022-03-01', act:'2022-03-05' },
    { userId:'IW100008', name:'Sunil Rathore',    email:'sunil@example.com',   phone:'9999900008', rank:8,  area:9500,  pan:'SUNIL9012C', city:'Jaipur',    addr:'8, Civil Lines, Jaipur',     join:'2022-06-01', act:'2022-06-05' },
    { userId:'IW100007', name:'Pooja Agarwal',    email:'pooja@example.com',   phone:'9999900007', rank:7,  area:7200,  pan:'POOJA3456D', city:'Lucknow',   addr:'7, Hazratganj, Lucknow',     join:'2022-09-01', act:'2022-09-05' },
    { userId:'IW100006', name:'Deepak Verma',     email:'deepak@example.com',  phone:'9999900006', rank:6,  area:5500,  pan:'DEPAK7890E', city:'Pune',      addr:'6, Koregaon Park, Pune',     join:'2023-01-01', act:'2023-01-05' },
    { userId:'IW100005', name:'Anita Sharma',     email:'anita@example.com',   phone:'9999900005', rank:5,  area:4000,  pan:'ANITA1234F', city:'Bangalore', addr:'5, Indiranagar, Bangalore',  join:'2023-04-01', act:'2023-04-05' },
    { userId:'IW100004', name:'Vikram Joshi',     email:'vikram@example.com',  phone:'9999900004', rank:4,  area:2800,  pan:'VIKRM5678G', city:'Chennai',   addr:'4, Anna Nagar, Chennai',     join:'2023-07-01', act:'2023-07-05' },
    { userId:'IW100003', name:'Priya Verma',      email:'priya@example.com',   phone:'9999900003', rank:3,  area:1800,  pan:'PRIYA9012H', city:'Hyderabad', addr:'3, Banjara Hills, Hyderabad',join:'2023-10-01', act:'2023-10-05' },
    { userId:'IW100002', name:'Suresh Sharma',    email:'developmenttestingtest@gmail.com',  phone:'9999900002', rank:2,  area:800,   pan:'SURESH345I', city:'Jaipur',    addr:'2, Malviya Nagar, Jaipur',   join:'2024-01-01', act:'2024-01-05' },
    { userId:'IW100001', name:'Rajesh Kumar',     email:'developertest@yopmail.com',  phone:'9999900001', rank:1,  area:300,   pan:'ABCDE1234F', city:'Jaipur',    addr:'1, Gandhi Nagar, Jaipur',    join:'2024-06-01', act:'2024-06-05' },
  ];

  // Create in top-down order so sponsorId can be set
  const assocMap = {};
  let prevAssocId = null;

  for (const r of rankData) {
    const a = await prisma.associate.upsert({
      where: { userId: r.userId },
      update: {},
      create: {
        userId:         r.userId,
        name:           r.name,
        email:          r.email,
        phone:          r.phone,
        password:       ap,
        status:         'ACTIVE',
        rank:           r.rank,
        totalAreaSold:  r.area,
        sponsorId:      prevAssocId, // each sponsors the one below
        address:        r.addr,
        city:           r.city,
        state:          'Rajasthan',
        pincode:        '302001',
        panNumber:      r.pan,
        joiningDate:    new Date(r.join),
        activationDate: new Date(r.act),
      },
    });
    assocMap[r.userId] = a;
    prevAssocId = a.id;
  }

  // Convenient aliases (used below for bookings/tree)
  const assoc10 = assocMap['IW100010']; // President Club — root
  const assoc9  = assocMap['IW100009'];
  const assoc8  = assocMap['IW100008'];
  const assoc7  = assocMap['IW100007'];
  const assoc6  = assocMap['IW100006'];
  const assoc5  = assocMap['IW100005'];
  const assoc4  = assocMap['IW100004'];
  const assoc3  = assocMap['IW100003'];
  const assoc2  = assocMap['IW100002']; // Business Adviser — good test sponsor
  const assoc1  = assocMap['IW100001']; // Business Associate — rank 1

  console.log(`✅ Associates seeded (IW100001–IW100010, full rank ladder rank 1–10)');
  console.log('   Tip: Use IW100002–IW100010 as sponsorId when testing new registration`);

  // ─── Wallets ──────────────────────────────────────────────────────────────
  const walletData = [
    { assoc: assoc10, balance: 250000, credits: 500000, debits: 250000 },
    { assoc: assoc9,  balance: 180000, credits: 380000, debits: 200000 },
    { assoc: assoc8,  balance: 120000, credits: 250000, debits: 130000 },
    { assoc: assoc7,  balance: 85000,  credits: 180000, debits: 95000  },
    { assoc: assoc6,  balance: 55000,  credits: 120000, debits: 65000  },
    { assoc: assoc5,  balance: 38000,  credits: 80000,  debits: 42000  },
    { assoc: assoc4,  balance: 22000,  credits: 48000,  debits: 26000  },
    { assoc: assoc3,  balance: 12000,  credits: 28000,  debits: 16000  },
    { assoc: assoc2,  balance: 7500,   credits: 18000,  debits: 10500  },
    { assoc: assoc1,  balance: 2500,   credits: 6000,   debits: 3500   },
  ];
  for (const w of walletData) {
    await prisma.wallet.upsert({
      where:  { associateId: w.assoc.id },
      update: {},
      create: { associateId: w.assoc.id, balance: w.balance, totalCredits: w.credits, totalDebits: w.debits },
    });
  }
  console.log('✅ Wallets seeded (all 10 associates)');

  // ─── Binary Tree (linear chain: 10→9→8→7→6→5→4→3→2→1) ────────────────────
  const treeNodes = {};
  const orderedIds = ['IW100010','IW100009','IW100008','IW100007','IW100006','IW100005','IW100004','IW100003','IW100002','IW100001'];

  for (let i = 0; i < orderedIds.length; i++) {
    const assoc = assocMap[orderedIds[i]];
    const parentNode = i > 0 ? treeNodes[orderedIds[i - 1]] : null;
    const node = await prisma.treeNode.upsert({
      where:  { associateId: assoc.id },
      update: {},
      create: {
        associateId: assoc.id,
        parentId:    parentNode?.id || null,
        position:    i % 2 === 0 ? 'LEFT' : 'RIGHT',
        level:       i,
        leftVolume:  Math.max(0, 50000 - i * 4500),
        rightVolume: Math.max(0, 40000 - i * 3800),
      },
    });
    treeNodes[orderedIds[i]] = node;

    // Link parent's child pointer
    if (parentNode) {
      const pos = i % 2 === 0 ? 'LEFT' : 'RIGHT';
      if (pos === 'LEFT') {
        await prisma.treeNode.update({ where: { id: parentNode.id }, data: { leftChildId: node.id } });
        parentNode.leftChildId = node.id;
      } else {
        await prisma.treeNode.update({ where: { id: parentNode.id }, data: { rightChildId: node.id } });
        parentNode.rightChildId = node.id;
      }
    }
  }
  console.log('✅ Binary tree seeded (IW100010 root → linear chain down to IW100001)');

  // ─── Plot Bookings ────────────────────────────────────────────────────────
  const bookings = [
    { id:'booking-001', aId:assoc1.id, pId:property1.id, cName:'Ramesh Gupta',    cMob:'9876543210', cAddr:'12, Civil Lines, Jaipur',    plotNo:'46', siteNo:'A-12', area:200, cpu:2500, chg:5000,  disc:0,    bcv:500000, tc:505000, amt:100000, mop:'Online',  chqNo:null,          pd:'2025-05-15', bank:'HDFC Bank',          emi:'Monthly',   rcpt:'REC000001', status:'CONFIRMED' },
    { id:'booking-002', aId:assoc2.id, pId:property2.id, cName:'Deepak Chauhan',  cMob:'9876543211', cAddr:'56, Tonk Road, Jaipur',      plotNo:'78', siteNo:'B-05', area:500, cpu:1800, chg:10000, disc:5000, bcv:900000, tc:905000, amt:200000, mop:'Cheque',  chqNo:'CHQ123456',   pd:'2025-04-20', bank:'State Bank of India', emi:'Quarterly', rcpt:'REC000002', status:'CONFIRMED' },
    { id:'booking-003', aId:assoc3.id, pId:property1.id, cName:'Sunita Devi',     cMob:'9876543212', cAddr:'89, Mansarovar, Jaipur',     plotNo:'52', siteNo:'A-18', area:150, cpu:2500, chg:3000,  disc:2000, bcv:375000, tc:376000, amt:75000,  mop:'UPI',     chqNo:'UPI-REF-789', pd:'2025-03-10', bank:'ICICI Bank',          emi:'Monthly',   rcpt:'REC000003', status:'CONFIRMED' },
    { id:'booking-004', aId:assoc4.id, pId:property3.id, cName:'Vikram Singh',    cMob:'9876543213', cAddr:'23, Sitapura, Jaipur',       plotNo:'15', siteNo:'C-03', area:100, cpu:5000, chg:8000,  disc:0,    bcv:500000, tc:508000, amt:150000, mop:'NEFT',    chqNo:'NEFT-REF-456',pd:'2025-05-28', bank:'Axis Bank',           emi:'Half Yearly',rcpt:null,        status:'PENDING' },
    { id:'booking-005', aId:assoc1.id, pId:property2.id, cName:'Anita Bose',      cMob:'9876543214', cAddr:'67, Vaishali Nagar, Jaipur', plotNo:'91', siteNo:'B-11', area:300, cpu:1800, chg:6000,  disc:3000, bcv:540000, tc:543000, amt:100000, mop:'Cash',    chqNo:null,          pd:'2025-06-01', bank:null,                 emi:'Monthly',   rcpt:null,        status:'PENDING' },
    { id:'booking-006', aId:assoc2.id, pId:property1.id, cName:'Ritu Saxena',     cMob:'9876543215', cAddr:'44, Malviya Nagar, Jaipur',  plotNo:'33', siteNo:'A-07', area:250, cpu:2500, chg:4000,  disc:1000, bcv:625000, tc:628000, amt:125000, mop:'Online',  chqNo:'TXN-987654',  pd:'2025-06-02', bank:'Punjab National Bank',emi:'Monthly',   rcpt:null,        status:'PENDING' },
  ];
  for (const b of bookings) {
    await prisma.booking.upsert({ where:{id:b.id}, update:{}, create:{id:b.id,associateId:b.aId,propertyId:b.pId,customerName:b.cName,customerMobile:b.cMob,customerAddress:b.cAddr,plotNo:b.plotNo,siteNo:b.siteNo,plotArea:b.area,costPerUnit:b.cpu,chargeOfPlot:b.chg,discount:b.disc,totalBCV:b.bcv,totalCost:b.tc,amount:b.amt,modeOfPayment:b.mop,chequeNo:b.chqNo,paymentDate:new Date(b.pd),bankName:b.bank,emiMode:b.emi,receiptNo:b.rcpt,status:b.status} });
  }
  console.log('✅ Plot bookings seeded (3 confirmed with receipts, 3 pending)');

  // ─── Wallet Transactions (only if none exist) ─────────────────────────────
  const wallet1 = await prisma.wallet.findUnique({ where:{associateId:assoc10.id} });
  if (wallet1) {
    const existingCount = await prisma.transaction.count({ where:{walletId:wallet1.id} });
    if (existingCount === 0) {
      const txRows = [
        { type:'FUND_TRANSFER_OUT', amount:3254, desc:'Fund transfer to IW100002', daysAgo:150 },
        { type:'WITHDRAWAL',        amount:4638, desc:'Withdrawal request',         daysAgo:135 },
        { type:'ADMIN_CREDIT',      amount:2466, desc:'Admin bonus credit',          daysAgo:120 },
        { type:'FUND_TRANSFER_OUT', amount:4935, desc:'Fund transfer to IW100003',  daysAgo:105 },
        { type:'DIRECT_INCOME',     amount:2307, desc:'Direct income from IW100004 sale', daysAgo:90 },
        { type:'FUND_TRANSFER_OUT', amount:3327, desc:'Fund transfer to IW100002',  daysAgo:75 },
        { type:'ADMIN_CREDIT',      amount:2992, desc:'Festival bonus',              daysAgo:60 },
        { type:'LEVEL_INCOME',      amount:3450, desc:'Level income - Level 2',      daysAgo:45 },
        { type:'FUND_TRANSFER_IN',  amount:127,  desc:'Fund received from IW100004', daysAgo:30 },
        { type:'ADMIN_CREDIT',      amount:1738, desc:'Promotion reward',            daysAgo:15 },
      ];
      const CREDITS = ['DIRECT_INCOME','LEVEL_INCOME','ADMIN_CREDIT','FUND_TRANSFER_IN'];
      let bal = Number(wallet1.balance);
      for (const tx of txRows) {
        bal = CREDITS.includes(tx.type) ? bal + tx.amount : bal - tx.amount;
        await prisma.transaction.create({ data:{ walletId:wallet1.id, type:tx.type, amount:tx.amount, balanceAfter:Math.max(0,bal), description:tx.desc, status:'COMPLETED', createdAt:new Date(Date.now() - tx.daysAgo * 86400000) } });
      }
      console.log('✅ Sample wallet transactions seeded');
    } else {
      console.log('⏭️  Wallet transactions already exist — skipping');
    }
  }

  // ─── Summary ──────────────────────────────────────────────────────────────
  console.log('\n🎉 Database seeding complete!');
  console.log('\n📋 Credentials:');
  console.log('   Admin:      admindevelopertest@yopmail.com  /  Admin@123456');
  console.log('   Associates: IW100001 – IW100010       /  Test@1234');
  console.log('\n📦 What was seeded:');
  console.log('   • 4 admin roles + 1 super admin');
  console.log('   • 1 default package + income plans');
  console.log('   • 31 states, 6 property categories');
  console.log('   • 8 commission slabs (gap model, matches seed-commission-slabs.js)');
  console.log('   • 5 PLC charges, 6 plot types, 2 account masters');
  console.log('   • 2 schemes (Swarn Nagar, Veera Residency) + 10 sample plots');
  console.log('   • 3 sample properties');
  console.log('   • 10 associates (IW100001–IW100010) — full rank ladder rank 1 to 10');
  console.log('   • 6 plot bookings (3 confirmed/receipted, 3 pending)');
  console.log('   • 10 sample wallet transactions for IW100010');
  console.log('\n🏅 Rank ladder for registration testing:');
  console.log('   IW100010  President Club    (rank 10) — unlimited downlines');
  console.log('   IW100009  President Sales   (rank 9)');
  console.log('   IW100008  Vice President    (rank 8)');
  console.log('   IW100007  National BH       (rank 7)');
  console.log('   IW100006  Regional BH       (rank 6)');
  console.log('   IW100005  State BH          (rank 5)');
  console.log('   IW100004  Dist. BH          (rank 4)');
  console.log('   IW100003  Business Head     (rank 3)');
  console.log('   IW100002  Business Adviser  (rank 2) ← best for testing (can add up to 3)');
  console.log('   IW100001  Business Associate(rank 1) ← cannot sponsor new members');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
