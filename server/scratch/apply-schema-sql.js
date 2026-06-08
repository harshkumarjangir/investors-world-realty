import prisma from '../src/utils/prisma.js';

async function main() {
  console.log('Starting raw SQL migration...');

  try {
    // 1. Add enum values. Note: ALTER TYPE ADD VALUE cannot be executed inside a transaction block in Postgres,
    // so we execute them individually. We catch errors in case they already exist.
    try {
      await prisma.$executeRawUnsafe(`ALTER TYPE "PropertyStatus" ADD VALUE 'HOLD'`);
      console.log('Added HOLD to PropertyStatus enum');
    } catch (err) {
      console.log('PropertyStatus HOLD enum value might already exist:', err.message);
    }

    try {
      await prisma.$executeRawUnsafe(`ALTER TYPE "BookingStatus" ADD VALUE 'HOLD'`);
      console.log('Added HOLD to BookingStatus enum');
    } catch (err) {
      console.log('BookingStatus HOLD enum value might already exist:', err.message);
    }

    try {
      await prisma.$executeRawUnsafe(`ALTER TYPE "BookingStatus" ADD VALUE 'EXPIRED'`);
      console.log('Added EXPIRED to BookingStatus enum');
    } catch (err) {
      console.log('BookingStatus EXPIRED enum value might already exist:', err.message);
    }

    // 2. Add columns to Property table
    console.log('Adding columns to Property table...');
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Property" 
        ADD COLUMN IF NOT EXISTS "holdExpiresAt" TIMESTAMP(3),
        ADD COLUMN IF NOT EXISTS "heldByAssociateId" TEXT
      `);
      console.log('Added hold columns to Property table');
    } catch (err) {
      console.error('Failed to add columns to Property:', err.message);
    }

    // 3. Add FK constraint if heldByAssociateId exists and doesn't have constraint
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Property" 
        ADD CONSTRAINT "Property_heldByAssociateId_fkey" 
        FOREIGN KEY ("heldByAssociateId") REFERENCES "Associate"("id") ON DELETE SET NULL ON UPDATE CASCADE
      `);
      console.log('Added foreign key constraint to Property table');
    } catch (err) {
      console.log('FK constraint to Associate might already exist:', err.message);
    }

    // 4. Add columns to Booking table
    console.log('Adding columns to Booking table...');
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Booking" 
        ADD COLUMN IF NOT EXISTS "razorpayOrderId" TEXT,
        ADD COLUMN IF NOT EXISTS "razorpayPaymentId" TEXT,
        ADD COLUMN IF NOT EXISTS "razorpaySignature" TEXT
      `);
      console.log('Added Razorpay columns to Booking table');
    } catch (err) {
      console.error('Failed to add columns to Booking:', err.message);
    }

    // 5. Add unique index for razorpayOrderId
    try {
      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "Booking_razorpayOrderId_key" ON "Booking"("razorpayOrderId")
      `);
      console.log('Added unique index for razorpayOrderId');
    } catch (err) {
      console.log('Unique index on razorpayOrderId might already exist:', err.message);
    }

    console.log('SQL Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
