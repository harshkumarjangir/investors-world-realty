import 'dotenv/config';
import crypto from 'crypto';
import prisma from '../src/utils/prisma.js';
import config from '../src/config/index.js';
import { holdProperty, initiatePropertyPayment, verifyPropertyPayment } from '../src/services/booking.service.js';
import { adminUpdatePropertyStatus } from '../src/services/admin/property.service.js';

async function runTest() {
  console.log('\n🚀 Starting Property & Commission Distribution Integration Test...\n');

  try {
    // 1. Find or create Scheme
    let scheme = await prisma.scheme.findFirst();
    if (!scheme) {
      scheme = await prisma.scheme.create({
        data: {
          schemeName: "Test Scheme",
          address: "123 Test Road",
          city: "Jaipur",
          state: "Rajasthan",
        }
      });
      console.log(`Created temporary Scheme: ${scheme.schemeName}`);
    }

    // 2. Find or create Admin
    let admin = await prisma.admin.findFirst();
    if (!admin) {
      let role = await prisma.adminRole.findFirst();
      if (!role) {
        role = await prisma.adminRole.create({
          data: {
            name: "Super Admin",
            permissions: ["properties:write", "properties:read", "transactions:read"],
          }
        });
      }
      admin = await prisma.admin.create({
        data: {
          name: "Test Admin",
          email: "testadmin@test.com",
          phone: "9999999990",
          password: "hashedpassword", // dummy
          roleId: role.id,
        }
      });
      console.log(`Created temporary Admin: ${admin.name}`);
    }

    // 3. Find Associate
    const associate = await prisma.associate.findFirst({
      where: { userId: 'IW100001' }
    });
    if (!associate) {
      throw new Error("Associate 'IW100001' not found. Please run seed-dummy or seed-slabs first.");
    }
    console.log(`Found Associate: ${associate.name} (${associate.userId}) | Rank: ${associate.rank}`);

    // 4. Create Property (Price: 1,000,000)
    const property = await prisma.property.create({
      data: {
        schemeId: scheme.id,
        name: "Test Plot for 10 Lakhs",
        description: "100 gaj test property for automated flow validation",
        location: "Jaipur",
        city: "Jaipur",
        state: "Rajasthan",
        area: 100,
        price: 1000000,
        type: "Plot",
        amenities: ["Water", "Electricity"],
        status: "AVAILABLE",
      }
    });
    console.log(`Created Property: "${property.name}" | Price: ₹${Number(property.price).toLocaleString()} | Area: ${property.area} gaj`);

    // 5. Place on Hold
    const holdDetails = {
      customerName: "Test Customer",
      customerMobile: "9876543210",
      customerAddress: "123 Test St"
    };
    const holdBooking = await holdProperty(associate.id, property.id, holdDetails);
    console.log(`Step 1: Property placed on HOLD. Booking ID: ${holdBooking.id}`);

    // 6. Initiate Payment
    const paymentInitiate = await initiatePropertyPayment(associate.id, property.id, {
      amount: 50000,
      customerName: "Test Customer",
      customerMobile: "9876543210",
      customerAddress: "123 Test St"
    });
    const orderId = paymentInitiate.orderId;
    console.log(`Step 2: Payment Initiated. Razorpay Order ID: ${orderId}`);

    // 7. Verify Payment Signature & Confirm Booking
    const secret = config.RAZORPAY_KEY_SECRET;
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|pay_dummy123`)
      .digest('hex');

    const verifiedBooking = await verifyPropertyPayment(associate.id, {
      razorpayOrderId: orderId,
      razorpayPaymentId: 'pay_dummy123',
      razorpaySignature: generatedSignature,
    });
    console.log(`Step 3: Payment Verified. Booking status: ${verifiedBooking.status}`);

    // Verify status in DB is BOOKED
    let currentProp = await prisma.property.findUnique({ where: { id: property.id } });
    console.log(`Property status in database: "${currentProp.status}"`);

    // Verify no commissions were created yet
    let initialCommissionCount = await prisma.propertySaleCommission.count({ where: { propertyId: property.id } });
    console.log(`Commissions created in BOOKED state: ${initialCommissionCount} (Expected: 0)`);

    // 8. Mark Property as SOLD (Admin action)
    console.log(`\nStep 4: Transitioning Property status to "SOLD"...`);
    const soldProp = await adminUpdatePropertyStatus(property.id, 'SOLD', admin.id);
    console.log(`Property status in database: "${soldProp.status}"`);

    // 9. Fetch and display generated commissions
    const commissions = await prisma.propertySaleCommission.findMany({
      where: { propertyId: property.id }
    });

    const populatedCommissions = await Promise.all(commissions.map(async (c) => {
      const assoc = await prisma.associate.findUnique({
        where: { id: c.associateId },
        select: { userId: true, name: true, rank: true }
      });
      return { ...c, associate: assoc };
    }));

    console.log(`\n🎉 Success! commissions created: ${commissions.length}`);
    console.log('------------------------------------------------------------');
    console.log('Associate ID | Name             | Rank | %    | Coins');
    console.log('------------------------------------------------------------');
    populatedCommissions.forEach(c => {
      console.log(`${c.associate.userId.padEnd(12)} | ${c.associate.name.padEnd(16)} | ${String(c.associate.rank).padEnd(4)} | ${String(c.percentage).padEnd(4)} | ${Number(c.commissionAmount).toLocaleString()} Coins`);
    });
    console.log('------------------------------------------------------------\n');

    // Clean up test data (optional, but keep so they can check it in Admin panel / prisma studio)
    console.log('Test completed successfully. Test property records remain in database for inspection.\n');

  } catch (err) {
    console.error('❌ Test failed with error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
