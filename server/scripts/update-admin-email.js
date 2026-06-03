import prisma from '../src/utils/prisma.js';

async function main() {
  const updated = await prisma.admin.updateMany({
    where: { email: 'admindevelopertest@yopmail.com' },
    data: { email: 'admindevelopertest@yopmail.com' },
  });
  console.log(`Updated ${updated.count} admin(s) email to admindevelopertest@yopmail.com`);
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
