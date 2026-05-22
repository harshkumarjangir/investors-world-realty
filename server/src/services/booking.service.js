import prisma from '../utils/prisma.js';
import { sendToDevices } from '../utils/firebase.js';
import { calculatePropertySaleCommission } from './propertyCommission.service.js';

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

  // ─── Property Sale Commission (10-level upline chain) ──────────────────────
  (async () => {
    try {
      // Get full property details for area
      const property = await prisma.property.findUnique({
        where: { id: booking.propertyId },
        select: { price: true, area: true },
      });

      if (property) {
        await calculatePropertySaleCommission(
          booking.associateId,       // seller
          booking.propertyId,        // property
          bookingId,                 // booking
          Number(property.price),    // price
          Number(property.area),     // area in gaj
        );
      }
    } catch (err) {
      console.error('[COMMISSION] Property sale commission failed:', err.message);
    }
  })();

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
