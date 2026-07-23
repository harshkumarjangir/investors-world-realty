import prisma from '../src/utils/prisma.js';

async function main() {
  const updated = await prisma.admin.updateMany({
    where: { email: 'admindevelopertest@yopmail.com' },
    data: { email: 'supportiwr@gmail.com' },
  });
  console.log(`Updated ${updated.count} admin(s) email to supportiwr@gmail.com`);
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
