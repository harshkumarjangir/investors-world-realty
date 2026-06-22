import prisma from './src/utils/prisma.js';
async function run() {
  const p = await prisma.property.findUnique({ where: { id: '45906737-c6a7-4306-96f7-db69dc683041' }});
  console.log("Property name:", p?.name);
}
run().finally(() => process.exit(0));
