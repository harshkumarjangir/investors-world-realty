import prisma from '../src/utils/prisma.js';

async function migrateUserIds() {
  console.log('Starting userId migration: IW -> IWR...');
  
  try {
    // Find all associates with a userId starting with 'IW' but not 'IWR'
    const associates = await prisma.associate.findMany({
      where: {
        userId: {
          startsWith: 'IW',
          not: {
            startsWith: 'IWR'
          }
        }
      },
      select: {
        id: true,
        userId: true
      }
    });

    if (associates.length === 0) {
      console.log('No associates found that need migration.');
      return;
    }

    console.log(`Found ${associates.length} associates to migrate.`);

    let updatedCount = 0;
    for (const associate of associates) {
      const newUserId = associate.userId.replace(/^IW/, 'IWR');
      
      await prisma.associate.update({
        where: { id: associate.id },
        data: { userId: newUserId }
      });
      
      console.log(`Migrated ${associate.userId} -> ${newUserId}`);
      updatedCount++;
    }

    console.log(`Migration completed! Successfully updated ${updatedCount} associates.`);
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateUserIds();
