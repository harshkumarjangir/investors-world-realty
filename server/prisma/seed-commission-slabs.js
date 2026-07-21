import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding IWR commission slabs (exact chart match)...\n');

  await prisma.propertyCommissionSlab.deleteMany({});

  // Exact match to IWR chart:
  // sellerPercent = Level 1 (Business Associate) — the person who sells
  // level1Percent = Level 2 (Business Adviser) — seller's direct sponsor
  // level2Percent = Level 3 (Business Head) — 2nd ancestor
  // level3Percent = Level 4 (Dist. Business Head) — 3rd ancestor
  // level4Percent = Level 5 (State Business Head) — 4th ancestor
  // level5Percent = Level 6 (Regional Business Head) — 5th ancestor
  // level6Percent = Level 7 (National Business Head) — 6th ancestor
  // level7Percent = Level 8 (Vice President Sales) — 7th ancestor
  // level8Percent = Level 9 (President Sales) — 8th ancestor
  // level9Percent = Level 10 (President Club) — 9th ancestor
  // level10Percent = 0 (no one beyond 10 levels)

  const slabs = [
    {
      minArea: 0, maxArea: 6000,
      sellerPercent: 4,      // L1 Business Associate
      level1Percent: 6,      // L2 Business Adviser
      level2Percent: 7.5,    // L3 Business Head
      level3Percent: 9,      // L4 Dist. Business Head
      level4Percent: 10,     // L5 State Business Head
      level5Percent: 11,     // L6 Regional Business Head
      level6Percent: 12,     // L7 National Business Head
      level7Percent: 13,     // L8 Vice President Sales
      level8Percent: 14,     // L9 President Sales
      level9Percent: 2,      // L10 President Club
      level10Percent: 0,
    },
    {
      minArea: 6001, maxArea: 10000,
      sellerPercent: 3,
      level1Percent: 5,
      level2Percent: 6.5,
      level3Percent: 8,
      level4Percent: 9,
      level5Percent: 10,
      level6Percent: 11,
      level7Percent: 12,
      level8Percent: 13,
      level9Percent: 2,
      level10Percent: 0,
    },
    {
      minArea: 10001, maxArea: 15000,
      sellerPercent: 2.5,
      level1Percent: 4,
      level2Percent: 5,
      level3Percent: 6,
      level4Percent: 6.8,
      level5Percent: 7.6,
      level6Percent: 8.4,
      level7Percent: 9.2,
      level8Percent: 10,
      level9Percent: 2,
      level10Percent: 0,
    },
    {
      minArea: 15001, maxArea: 20000,
      sellerPercent: 2.2,
      level1Percent: 3.2,
      level2Percent: 4,
      level3Percent: 4.8,
      level4Percent: 5.5,
      level5Percent: 6.2,
      level6Percent: 6.9,
      level7Percent: 7.6,
      level8Percent: 8.3,
      level9Percent: 2,
      level10Percent: 0,
    },
    {
      minArea: 20001, maxArea: 25000,
      sellerPercent: 1.8,
      level1Percent: 2.7,
      level2Percent: 3.4,
      level3Percent: 4.1,
      level4Percent: 4.8,
      level5Percent: 5.5,
      level6Percent: 6.1,
      level7Percent: 6.7,
      level8Percent: 7.3,
      level9Percent: 2,
      level10Percent: 0,
    },
    {
      minArea: 25001, maxArea: 30000,
      sellerPercent: 1.5,
      level1Percent: 2.3,
      level2Percent: 2.9,
      level3Percent: 3.5,
      level4Percent: 4.1,
      level5Percent: 4.7,
      level6Percent: 5.2,
      level7Percent: 5.7,
      level8Percent: 6.2,
      level9Percent: 2,
      level10Percent: 0,
    },
    {
      minArea: 30001, maxArea: 35000,
      sellerPercent: 1.3,
      level1Percent: 2,
      level2Percent: 2.6,
      level3Percent: 3.2,
      level4Percent: 3.7,
      level5Percent: 4.2,
      level6Percent: 4.7,
      level7Percent: 5.1,
      level8Percent: 5.6,
      level9Percent: 2,
      level10Percent: 0,
    },
  ];

  for (const slab of slabs) {
    await prisma.propertyCommissionSlab.create({ data: slab });
  }

  console.log('✅ 8 commission slabs created\n');
  console.log('Commission Flow Example (5000 gaj property, ₹50,00,000):');
  console.log('─────────────────────────────────────────────────────────');
  console.log('Seller (L1 Business Associate)     → 4%  = ₹2,00,000');
  console.log('↑ Sponsor (L2 Business Adviser)    → 6%  = ₹3,00,000');
  console.log('↑ 2nd up (L3 Business Head)        → 7.5%= ₹3,75,000');
  console.log('↑ 3rd up (L4 Dist. Business Head)  → 9%  = ₹4,50,000');
  console.log('↑ 4th up (L5 State Business Head)  → 10% = ₹5,00,000');
  console.log('↑ 5th up (L6 Regional Business Head)→ 11%= ₹5,50,000');
  console.log('↑ 6th up (L7 National Business Head)→ 12%= ₹6,00,000');
  console.log('↑ 7th up (L8 Vice President Sales) → 13% = ₹6,50,000');
  console.log('↑ 8th up (L9 President Sales)      → 14% = ₹7,00,000');
  console.log('↑ 9th up (L10 President Club)      → 2%  = ₹1,00,000');
  console.log('─────────────────────────────────────────────────────────');
  console.log('Downline → ₹0 (nothing)');
  console.log('\n🎉 Done!');
}

main()
  .catch((e) => { console.error('❌ Failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
