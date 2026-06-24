import prisma from '../utils/prisma.js';
import { sendToDevices } from '../utils/firebase.js';
import { calculatePropertySaleCommission } from './propertyCommission.service.js';
import { getRazorpayInstance, verifyRazorpaySignature } from '../utils/razorpay.js';

// ─── createBooking ────────────────────────────────────────────────────────────

/**
 * Create a new property booking for an associate.
 * @param {string} associateId
 * @param {string} propertyId
 * @param {number} amount
 * @returns {Promise<object>} Created Booking
 */
export async function createBooking(associateId, propertyId, amount) {
  const property = await prisma.property.findFirst({
    where: { id: propertyId, deletedAt: null },
    select: { id: true, status: true, name: true },
  });

  if (!property) {
    throw Object.assign(new Error('Property not found'), { statusCode: 404 });
  }

  if (property.status !== 'AVAILABLE') {
    throw Object.assign(new Error('Property is not available for booking'), { statusCode: 400 });
  }

  const booking = await prisma.booking.create({
    data: {
      associateId,
      propertyId,
      amount,
      status: 'PENDING',
      plotArea: property.area,
      totalCost: property.price,
    },
  });

  return booking;
}

// ─── getBookings ──────────────────────────────────────────────────────────────

/**
 * Return paginated bookings with property details for an associate.
 * @param {string} associateId
 * @param {{ page, pageSize, skip, take }} pagination
 */
export async function getBookings(associateId, pagination = {}) {
  const { page = 1, pageSize = 20, skip = 0, take = 20 } = pagination;

  const [records, totalItems] = await Promise.all([
    prisma.booking.findMany({
      where: { associateId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      select: {
        id: true,
        createdAt: true,
        amount: true,
        status: true,
        receiptUrl: true,
        property: {
          select: {
            name: true,
            location: true,
            price: true,
            status: true,
          },
        },
      },
    }),
    prisma.booking.count({ where: { associateId } }),
  ]);

  const items = records.map((r) => ({
    id: r.id,
    property: {
      name: r.property.name,
      location: r.property.location,
      price: Number(r.property.price),
      status: r.property.status,
    },
    bookingDate: r.createdAt,
    amount: Number(r.amount),
    status: r.status,
    receiptUrl: r.receiptUrl,
  }));

  return { items, totalItems, page, pageSize };
}

// ─── adminApproveBooking ──────────────────────────────────────────────────────

/**
 * Admin approves a booking: sets booking to CONFIRMED, property to BOOKED.
 * @param {string} bookingId
 * @param {string} adminId
 * @returns {Promise<object>} Updated Booking
 */
export async function adminApproveBooking(bookingId, adminId) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { property: { select: { id: true, name: true } } },
  });

  if (!booking) {
    throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
  }

  if (booking.status !== 'PENDING') {
    throw Object.assign(new Error('Only pending bookings can be approved'), { statusCode: 400 });
  }

  const [updatedBooking] = await prisma.$transaction([
    prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
    }),
    prisma.property.update({
      where: { id: booking.propertyId },
      data: { status: 'BOOKED' },
    }),
    prisma.adminAuditLog.create({
      data: {
        adminId,
        action: 'APPROVE_BOOKING',
        entity: 'Booking',
        entityId: bookingId,
        details: { propertyId: booking.propertyId, associateId: booking.associateId },
      },
    }),
  ]);

  // Fire-and-forget push notification
  (async () => {
    try {
      const tokens = await prisma.deviceToken.findMany({ where: { associateId: booking.associateId } });
      const tokenList = tokens.map((t) => t.token);
      if (tokenList.length > 0) {
        await sendToDevices(tokenList, {
          title: 'Booking Confirmed',
          body: `Your booking for ${booking.property.name} has been confirmed.`,
        }, { type: 'BOOKING', bookingId });
      }
    } catch (err) {
      console.error('[BOOKING] Push notification failed:', err.message);
    }
  })();

  // Commission calculation removed from booking confirmation (should only run when property is sold)

  return updatedBooking;
}

// ─── adminCancelBooking ───────────────────────────────────────────────────────

/**
 * Admin cancels a booking. Reverts property to AVAILABLE if it was BOOKED.
 * @param {string} bookingId
 * @param {string} adminId
 * @param {string} [reason]
 * @returns {Promise<object>} Updated Booking
 */
export async function adminCancelBooking(bookingId, adminId, reason = null) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { property: { select: { id: true, name: true, status: true } } },
  });

  if (!booking) {
    throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
  }

  if (booking.status === 'CANCELLED') {
    throw Object.assign(new Error('Booking is already cancelled'), { statusCode: 400 });
  }

  const ops = [
    prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    }),
    prisma.adminAuditLog.create({
      data: {
        adminId,
        action: 'CANCEL_BOOKING',
        entity: 'Booking',
        entityId: bookingId,
        details: { reason, propertyId: booking.propertyId, associateId: booking.associateId },
      },
    }),
  ];

  // Revert property to AVAILABLE if it was BOOKED due to this booking
  if (booking.property.status === 'BOOKED') {
    ops.push(
      prisma.property.update({
        where: { id: booking.propertyId },
        data: { status: 'AVAILABLE' },
      }),
    );
  }

  const [updatedBooking] = await prisma.$transaction(ops);

  // Fire-and-forget push notification
  (async () => {
    try {
      const tokens = await prisma.deviceToken.findMany({ where: { associateId: booking.associateId } });
      const tokenList = tokens.map((t) => t.token);
      if (tokenList.length > 0) {
        await sendToDevices(tokenList, {
          title: 'Booking Cancelled',
          body: `Your booking for ${booking.property.name} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
        }, { type: 'BOOKING', bookingId });
      }
    } catch (err) {
      console.error('[BOOKING] Push notification failed:', err.message);
    }
  })();

  return updatedBooking;
}

// ─── holdProperty ──────────────────────────────────────────────────────────────
export async function holdProperty(associateId, propertyId, customerDetails) {
  const { customerName, customerMobile, customerAddress } = customerDetails;

  const property = await prisma.property.findFirst({
    where: { id: propertyId, deletedAt: null },
  });

  if (!property) {
    throw Object.assign(new Error('Property not found'), { statusCode: 404 });
  }

  if (property.status !== 'AVAILABLE') {
    throw Object.assign(new Error(`Property is not available. Current status: ${property.status}`), { statusCode: 400 });
  }

  const holdExpiresAt = new Date();
  holdExpiresAt.setHours(holdExpiresAt.getHours() + 48);

  const [booking] = await prisma.$transaction([
    prisma.booking.create({
      data: {
        associateId,
        propertyId,
        customerName: customerName || null,
        customerMobile: customerMobile || null,
        customerAddress: customerAddress || null,
        amount: 0,
        status: 'HOLD',
        modeOfPayment: 'Hold',
        paymentDate: new Date(),
        plotArea: property.area,
        totalCost: property.price,
      },
    }),
    prisma.property.update({
      where: { id: propertyId },
      data: {
        status: 'HOLD',
        holdExpiresAt,
        heldByAssociateId: associateId,
      },
    }),
  ]);

  // Push notification to associate
  (async () => {
    try {
      const tokens = await prisma.deviceToken.findMany({ where: { associateId } });
      const tokenList = tokens.map((t) => t.token);
      if (tokenList.length > 0) {
        await sendToDevices(tokenList, {
          title: 'Property Placed on Hold',
          body: `Property "${property.name}" is now on hold for 48 hours for your customer.`,
        }, { type: 'PROPERTY_HOLD', propertyId });
      }
    } catch (err) {
      console.error('[HOLD] Push notification failed:', err.message);
    }
  })();

  return booking;
}

// ─── initiatePropertyPayment ──────────────────────────────────────────────────
export async function initiatePropertyPayment(associateId, propertyId, { amount, customerName, customerMobile, customerAddress }) {
  const property = await prisma.property.findFirst({
    where: { id: propertyId, deletedAt: null },
  });

  if (!property) {
    throw Object.assign(new Error('Property not found'), { statusCode: 404 });
  }

  if (property.status === 'BOOKED' || property.status === 'SOLD') {
    throw Object.assign(new Error('Property is already booked or sold'), { statusCode: 400 });
  }

  if (property.status === 'HOLD') {
    if (property.heldByAssociateId !== associateId) {
      throw Object.assign(new Error('Property is currently on hold. Only full payment (in person) can override this hold.'), { statusCode: 400 });
    }
  }

  // Create Razorpay Order
  const options = {
    amount: Math.round(parseFloat(amount) * 100),
    currency: 'INR',
    receipt: `rcpt_book_${Date.now()}`,
  };

  const razorpayInstance = getRazorpayInstance();
  const order = await razorpayInstance.orders.create(options);

  // Check for existing active HOLD booking for this property by this associate
  const existingHold = await prisma.booking.findFirst({
    where: {
      propertyId,
      associateId,
      status: 'HOLD',
    },
    orderBy: { createdAt: 'desc' },
  });

  let booking;
  if (existingHold) {
    // Reuse/update hold booking with payment details
    booking = await prisma.booking.update({
      where: { id: existingHold.id },
      data: {
        amount: parseFloat(amount),
        razorpayOrderId: order.id,
        customerName: customerName || existingHold.customerName,
        customerMobile: customerMobile || existingHold.customerMobile,
        customerAddress: customerAddress || existingHold.customerAddress,
        plotArea: property.area,
        totalCost: property.price,
      },
    });
  } else {
    // Create new pending booking
    booking = await prisma.booking.create({
      data: {
        associateId,
        propertyId,
        customerName: customerName || null,
        customerMobile: customerMobile || null,
        customerAddress: customerAddress || null,
        amount: parseFloat(amount),
        status: 'PENDING',
        razorpayOrderId: order.id,
        plotArea: property.area,
        totalCost: property.price,
      },
    });
  }

  return {
    orderId: order.id,
    amount: options.amount,
    currency: options.currency,
    bookingId: booking.id,
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
  };
}

// ─── verifyPropertyPayment ────────────────────────────────────────────────────
export async function verifyPropertyPayment(associateId, { razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  // 1. Verify payment signature
  const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  if (!isValid) {
    throw Object.assign(new Error('Invalid payment signature'), { statusCode: 400 });
  }

  // 2. Fetch booking and property details
  const booking = await prisma.booking.findFirst({
    where: { razorpayOrderId },
    include: { property: true },
  });

  if (!booking) {
    throw Object.assign(new Error('Booking record not found for this order'), { statusCode: 404 });
  }

  // If already confirmed, return it (idempotency)
  if (booking.status === 'CONFIRMED') {
    return booking;
  }

  // 3. Confirm booking and update property status in transaction
  const lastBooking = await prisma.booking.findFirst({
    where: { receiptNo: { not: null, startsWith: 'REC' } },
    orderBy: { receiptNo: 'desc' },
  });
  let nextNum = 1;
  if (lastBooking && lastBooking.receiptNo) {
    const match = lastBooking.receiptNo.match(/REC(\d+)/);
    if (match) nextNum = parseInt(match[1], 10) + 1;
  }
  const receiptNo = `REC${String(nextNum).padStart(6, '0')}`;

  const [updatedBooking] = await prisma.$transaction([
    prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CONFIRMED',
        receiptNo,
        razorpayPaymentId,
        razorpaySignature,
        paymentDate: new Date(),
        modeOfPayment: 'Online (Razorpay)',
      },
    }),
    prisma.property.update({
      where: { id: booking.propertyId },
      data: {
        status: 'BOOKED',
        holdExpiresAt: null,
        heldByAssociateId: null,
      },
    }),
  ]);

  // Send push notification to buyer associate
  (async () => {
    try {
      const tokens = await prisma.deviceToken.findMany({ where: { associateId: booking.associateId } });
      const tokenList = tokens.map((t) => t.token);
      if (tokenList.length > 0) {
        await sendToDevices(tokenList, {
          title: 'Booking Payment Successful',
          body: `Your booking payment for "${booking.property.name}" has been processed successfully.`,
        }, { type: 'BOOKING_CONFIRMED', bookingId: booking.id });
      }
    } catch (err) {
      console.error('[BOOKING] Push notification failed:', err.message);
    }
  })();

  // Commission calculation removed from booking confirmation (should only run when property is sold)

  return updatedBooking;
}

// ─── recordPropertyPaymentFailure ─────────────────────────────────────────────
export async function recordPropertyPaymentFailure(associateId, { razorpayOrderId, errorReason }) {
  const booking = await prisma.booking.findFirst({
    where: { razorpayOrderId, associateId },
  });

  if (!booking) {
    throw Object.assign(new Error('Booking record not found for this order'), { statusCode: 404 });
  }

  // If already confirmed, don't fail it
  if (booking.status === 'CONFIRMED') {
    throw Object.assign(new Error('Booking is already confirmed'), { statusCode: 400 });
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: 'FAILED',
      // Optionally we could store the error reason in a new column, but for now we mark status as FAILED
    },
  });

  return updatedBooking;
}
