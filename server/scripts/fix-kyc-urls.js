import prisma from '../src/utils/prisma.js';

async function main() {
  // Get all KYC documents
  const docs = await prisma.kYCDocument.findMany();
  console.log(`Found ${docs.length} KYC documents`);

  for (const doc of docs) {
    let newUrl;
    if (doc.type === 'PAN') {
      newUrl = '/uploads/kyc/dummy-pan.png';
    } else if (doc.type === 'AADHAAR') {
      newUrl = '/uploads/kyc/dummy-aadhaar.png';
    } else {
      // BANK type doesn't have a file URL typically
      continue;
    }

    await prisma.kYCDocument.update({
      where: { id: doc.id },
      data: { documentUrl: newUrl },
    });
    console.log(`Updated ${doc.type} doc for associate ${doc.associateId} -> ${newUrl}`);
  }

  // Also update profile photos
  const associates = await prisma.associate.findMany({
    where: { profilePhoto: { not: null } },
  });
  console.log(`\nFound ${associates.length} associates with profile photos`);

  for (const a of associates) {
    await prisma.associate.update({
      where: { id: a.id },
      data: { profilePhoto: '/uploads/profiles/dummy.png' },
    });
    console.log(`Updated profile photo for ${a.userId}`);
  }

  // Update property images
  const images = await prisma.propertyImage.findMany();
  console.log(`\nFound ${images.length} property images`);

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const newUrl = i % 2 === 0
      ? '/uploads/properties/images/image-one.png'
      : '/uploads/properties/images/image-two.png';

    await prisma.propertyImage.update({
      where: { id: img.id },
      data: { url: newUrl },
    });
    console.log(`Updated property image ${img.id} -> ${newUrl}`);
  }

  console.log('\nDone!');
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
