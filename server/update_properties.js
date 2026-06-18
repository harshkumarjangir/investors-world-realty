import prisma from './src/utils/prisma.js';

async function main() {
  try {
    const result = await prisma.property.updateMany({
      data: {
        bookingMinAmount: 11000,
        bookingMaxAmount: 100000,
      },
    });
    console.log(`Successfully updated ${result.count} properties.`);
  } catch (error) {
    console.error('Error updating properties:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
