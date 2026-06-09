import prisma from '../src/utils/prisma.js';

async function main() {
  console.log('Checking PropertyStatus in prisma object:');
  // In Prisma, enums are located on the client instance or exported from @prisma/client
  // Let's check both
  try {
    const { PropertyStatus } = await import('@prisma/client');
    console.log('From @prisma/client:', PropertyStatus);
  } catch (err) {
    console.error('Failed to import @prisma/client:', err.message);
  }

  // Let's query a property to see what the DB says
  try {
    const sample = await prisma.property.findFirst({
      select: { status: true }
    });
    console.log('Sample property status from DB:', sample);
  } catch (err) {
    console.error('DB Query failed:', err.message);
  }

  await prisma.$disconnect();
}

main();
