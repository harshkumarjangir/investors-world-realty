import prisma from '../src/utils/prisma.js';

async function main() {
  const updated = await prisma.admin.updateMany({
    where: { email: 'admin@investorsworld.com' },
    data: { email: 'notespoint2023@gmail.com' },
  });
  console.log(`Updated ${updated.count} admin(s) email to notespoint2023@gmail.com`);
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
