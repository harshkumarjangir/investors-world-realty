import prisma from '../src/utils/prisma.js';

async function main() {
  const docs = await prisma.kYCDocument.findMany({
    select: { id: true, type: true, documentUrl: true, documentNumber: true, associate: { select: { userId: true, profilePhoto: true } } },
  });
  docs.forEach(d => console.log(`${d.associate.userId} | ${d.type} | url: ${d.documentUrl} | photo: ${d.associate.profilePhoto}`));
  process.exit(0);
}
main();
