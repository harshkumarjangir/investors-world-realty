import prisma from '../src/utils/prisma.js';

async function main() {
  console.log('Testing prisma.property.count with { status: { in: ["AVAILABLE", "HOLD"] } }...');

  try {
    const count = await prisma.property.count({
      where: {
        deletedAt: null,
        status: { in: ['AVAILABLE', 'HOLD'] }
      }
    });
    console.log('Query succeeded! Count:', count);
  } catch (err) {
    console.error('Query failed with error:');
    console.error(err);
  }

  await prisma.$disconnect();
}

main();
