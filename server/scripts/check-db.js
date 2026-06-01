import prisma from '../src/utils/prisma.js';

async function main() {
  try {
    const a = await prisma.associate.findFirst({ select: { rank: true, totalAreaSold: true, profilePhoto: true, userId: true } });
    console.log('✅ rank & totalAreaSold columns exist:', a);
  } catch (e) {
    console.log('❌ MISSING columns:', e.message);
  }
  process.exit(0);
}
main();
