import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding custom schemes and properties...');

  // 1. Create Lakeview Estates Scheme
  const scheme1 = await prisma.scheme.create({
    data: {
      schemeName: 'Lakeview Estates',
      state: 'Rajasthan',
      city: 'Udaipur',
      address: 'Fateh Sagar Lake Road, Udaipur',
      pinCode: '313001',
      schemeType: 'Residential',
      featuredScheme: true,
      shortDescription: 'Premium lake-facing residential properties.',
      description: 'Experience luxury living with panoramic views of the Fateh Sagar Lake.',
      isActive: true,
    },
  });

  // 2. Create Cyber Hub Business Park Scheme
  const scheme2 = await prisma.scheme.create({
    data: {
      schemeName: 'Cyber Hub Business Park',
      state: 'Haryana',
      city: 'Gurugram',
      address: 'Sector 29, Gurugram',
      pinCode: '122002',
      schemeType: 'Commercial',
      featuredScheme: true,
      shortDescription: 'State-of-the-art commercial spaces for modern businesses.',
      description: 'A premium commercial hub offering smart office spaces, retail outlets, and more.',
      isActive: true,
    },
  });

  console.log('✅ Created 2 new schemes.');

  // Properties for Lakeview Estates
  const prop1 = await prisma.property.create({
    data: {
      schemeId: scheme1.id,
      name: 'Lakefront Villa A1',
      description: 'A luxurious 4BHK villa with a private pool and lake view.',
      location: 'Plot A1, Lakeview Estates',
      city: 'Udaipur',
      state: 'Rajasthan',
      area: 3500,
      price: 25000000,
      type: 'Villa',
      amenities: ['Private Pool', 'Lake View', 'Garden', '24/7 Security'],
      status: 'AVAILABLE',
      isFeatured: true,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=1000', sortOrder: 1 },
          { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1000', sortOrder: 2 },
        ]
      }
    }
  });

  const prop2 = await prisma.property.create({
    data: {
      schemeId: scheme1.id,
      name: 'Lakefront Premium Plot B2',
      description: 'A spacious plot ready for your dream home.',
      location: 'Plot B2, Lakeview Estates',
      city: 'Udaipur',
      state: 'Rajasthan',
      area: 500,
      price: 5000000,
      type: 'Plot',
      amenities: ['Gated Community', 'Water Supply', 'Electricity'],
      status: 'AVAILABLE',
      isFeatured: false,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000', sortOrder: 1 },
        ]
      }
    }
  });

  // Properties for Cyber Hub
  const prop3 = await prisma.property.create({
    data: {
      schemeId: scheme2.id,
      name: 'Smart Office Space 101',
      description: 'A fully furnished smart office space suitable for startups.',
      location: 'Tower A, 1st Floor, Cyber Hub',
      city: 'Gurugram',
      state: 'Haryana',
      area: 1200,
      price: 15000000,
      type: 'Commercial',
      amenities: ['Central AC', 'Power Backup', 'Cafeteria', 'High-Speed Internet'],
      status: 'AVAILABLE',
      isFeatured: true,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000', sortOrder: 1 },
          { url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1000', sortOrder: 2 },
        ]
      }
    }
  });

  const prop4 = await prisma.property.create({
    data: {
      schemeId: scheme2.id,
      name: 'Retail Outlet Ground Floor',
      description: 'Prime retail space with high footfall visibility.',
      location: 'Tower B, Ground Floor, Cyber Hub',
      city: 'Gurugram',
      state: 'Haryana',
      area: 800,
      price: 20000000,
      type: 'Commercial',
      amenities: ['Main Road Facing', 'Parking', 'Security'],
      status: 'AVAILABLE',
      isFeatured: false,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1000', sortOrder: 1 },
        ]
      }
    }
  });

  console.log('✅ Created 4 new properties with Unsplash images.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
