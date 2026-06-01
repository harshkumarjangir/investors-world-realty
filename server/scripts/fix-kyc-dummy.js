import prisma from '../src/utils/prisma.js';

async function main() {
  // Get first 5 active associates
  const associates = await prisma.associate.findMany({
    where: { deletedAt: null, status: 'ACTIVE' },
    take: 5,
    select: { id: true, userId: true, name: true },
  });

  console.log(`Found ${associates.length} associates`);

  // Delete existing KYC docs and recreate with proper data
  await prisma.kYCDocument.deleteMany({});
  console.log('Cleared existing KYC documents');

  // Update all associates to have profile photos
  await prisma.associate.updateMany({
    where: { deletedAt: null },
    data: { profilePhoto: '/uploads/profiles/dummy.png' },
  });
  console.log('Updated all associates with profile photo');

  const kycData = [];

  // Associate 1: PAN (pending)
  if (associates[0]) {
    kycData.push({
      associateId: associates[0].id,
      type: 'PAN',
      documentNumber: 'ABCDE1000F',
      documentUrl: '/uploads/kyc/dummy-pan.png',
      status: 'PENDING',
    });
  }

  // Associate 2: BANK (pending)
  if (associates[1]) {
    kycData.push({
      associateId: associates[1].id,
      type: 'BANK',
      documentNumber: JSON.stringify({
        accountNumber: '1234567892',
        ifsc: 'SBIN0001234',
        bankName: 'State Bank of India',
        branch: 'Main Branch',
      }),
      documentUrl: '/uploads/kyc/dummy-pan.png',
      status: 'PENDING',
    });
  }

  // Associate 3: PAN (pending)
  if (associates[2]) {
    kycData.push({
      associateId: associates[2].id,
      type: 'PAN',
      documentNumber: 'ABCDF1003F',
      documentUrl: '/uploads/kyc/dummy-pan.png',
      status: 'PENDING',
    });
  }

  // Associate 4: BANK (pending)
  if (associates[3]) {
    kycData.push({
      associateId: associates[3].id,
      type: 'BANK',
      documentNumber: JSON.stringify({
        accountNumber: '1234567898',
        ifsc: 'SBIN0001234',
        bankName: 'State Bank of India',
        branch: 'Sector 22 Branch',
      }),
      documentUrl: '/uploads/kyc/dummy-aadhaar.png',
      status: 'PENDING',
    });
  }

  // Associate 5: AADHAAR (pending)
  if (associates[4]) {
    kycData.push({
      associateId: associates[4].id,
      type: 'AADHAAR',
      documentNumber: '100000000010',
      documentUrl: '/uploads/kyc/dummy-aadhaar.png',
      status: 'PENDING',
    });
  }

  for (const data of kycData) {
    await prisma.kYCDocument.create({ data });
    console.log(`Created ${data.type} KYC for associate ${data.associateId.slice(0, 8)}`);
  }

  console.log('\nDone! KYC dummy data created.');
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
