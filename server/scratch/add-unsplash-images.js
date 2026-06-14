import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const unsplashImages = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600607687931-5701d670bf9d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600566753086-00f18efc2291?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600585154526-990dced4ea0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
];

async function addImages() {
  const properties = await prisma.property.findMany();
  console.log(`Found ${properties.length} properties.`);

  // Clear existing images first just in case
  await prisma.propertyImage.deleteMany({});
  
  let count = 0;
  for (const property of properties) {
    // Add 3 random images for each property
    for (let i = 0; i < 3; i++) {
      const randomImage = unsplashImages[Math.floor(Math.random() * unsplashImages.length)];
      await prisma.propertyImage.create({
        data: {
          propertyId: property.id,
          url: randomImage // Changed to url based on PrismaClientValidationError
        }
      });
      count++;
    }
  }

  console.log(`Successfully added ${count} Unsplash images!`);
}

addImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
