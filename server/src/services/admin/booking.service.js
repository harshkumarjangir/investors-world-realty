import prisma from '../../utils/prisma.js';
import { sendToDevices } from '../../utils/firebase.js';

// ─── Generate Receipt Number ──────────────────────────────────────────────────
async function generateReceiptNo() {
  const count = await prisma.booking.count({ where: { receiptNo: { not: null } } });
  const next = count + 1;
  return `REC${String(next).padStart(6, '0')}`;
}

// ─── Create Plot Booking ──────────────────────────────────────────────────────
export async function createPlotBooking(data) {
  const {
    associateId, customerName, customerMobile, customerAddress,
    propertyId, plotType, plotNo, siteNo, plotArea, costPerUnit, chargeOfPlot,
    discount, totalBCV, totalCost, amount, amountPaid,
    modeOfPayment, chequeNo, paymentDate, bankName, drawnOn, emiMode,
  } = data;

  // Validate associate
  const associate = await prisma.associate.findFirst({
    where: { userId: associateId, deletedAt: null },
  });
  if (!associate) {
    throw Object.assign(new Error('Associate not found'), { statusCode: 404 });
  }

  // Validate property
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) {
    throw Object.assign(new Error('Property not found'), { statusCode: 404 });
  }

  if (property.status === 'BOOKED' || property.status === 'SOLD') {
    throw Object.assign(new Error('Property is already booked or sold'), { statusCode: 400 });
  }

  if (property.status === 'HOLD') {
    const bookingAmt = parseFloat(amount || amountPaid) || 0;
    if (associate.id !== property.heldByAssociateId && bookingAmt < Number(property.price)) {
      throw Object.assign(
        new Error(`Property is currently on hold. Only full payment (at least ${property.price}) can override this hold.`),
        { statusCode: 400 }
      );
    }
  }

  const booking = await prisma.booking.create({
    data: {
      associateId: associate.id,
      propertyId,
      customerName: customerName || null,
      customerMobile: customerMobile || null,
      customerAddress: customerAddress || null,
      plotNo: plotNo || null,
      siteNo: siteNo || null,
      plotArea: plotArea ? parseFloat(plotArea) : null,
      costPerUnit: costPerUnit ? parseFloat(costPerUnit) : null,
      chargeOfPlot: chargeOfPlot ? parseFloat(chargeOfPlot) : null,
      discount: discount ? parseFloat(discount) : 0,
      totalBCV: totalBCV ? parseFloat(totalBCV) : null,
      totalCost: totalCost ? parseFloat(totalCost) : null,
      amount: parseFloat(amount || amountPaid) || 0,
      modeOfPayment: modeOfPayment || null,
      chequeNo: chequeNo || null,
      paymentDate: paymentDate ? new Date(paymentDate) : null,
      bankName: bankName || null,
      drawnOn: drawnOn ? new Date(drawnOn) : null,
      emiMode: emiMode || null,
      status: 'PENDING',
    },
    include: {
      associate: { select: { userId: true, name: true } },
      property: { select: { name: true, location: true } },
    },
  });

  return booking;
}

// ─── List Unapproved Plot Bookings ────────────────────────────────────────────
export async function listUnapprovedBookings(pagination) {
  const { page, pageSize, skip, take } = pagination;

  const where = { status: 'PENDING' };

  const [items, totalItems] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        associate: { select: { userId: true, name: true, phone: true } },
        property: { select: { name: true, location: true } },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    items: items.map((b) => ({
      id: b.id,
      associateCode: b.associate.userId,
      associateName: b.associate.name,
      associatePhone: b.associate.phone,
      customerName: b.customerName,
      customerMobile: b.customerMobile,
      customerAddress: b.customerAddress,
      modeOfPayment: b.modeOfPayment,
      entryDate: b.createdAt,
      plotNo: b.plotNo,
      propertyName: b.property.name,
      totalCost: b.totalCost ? Number(b.totalCost) : null,
      amount: Number(b.amount),
      status: b.status,
    })),
    totalItems,
    page,
    pageSize,
  };
}

// ─── Approve Plot Booking ─────────────────────────────────────────────────────
export async function approvePlotBooking(bookingId) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { property: true },
  });
  if (!booking) throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
  if (booking.status !== 'PENDING') throw Object.assign(new Error('Booking is not pending'), { statusCode: 400 });

  const property = booking.property;
  if (property.status === 'BOOKED' || property.status === 'SOLD') {
    throw Object.assign(new Error('Property is already booked or sold'), { statusCode: 400 });
  }

  let isHoldOverride = false;
  let overriddenAssociateId = null;

  if (property.status === 'HOLD') {
    if (booking.associateId !== property.heldByAssociateId) {
      if (Number(booking.amount) < Number(property.price)) {
        throw Object.assign(
          new Error(`Property is currently on hold. Only a full payment (at least ${property.price}) can override this hold.`),
          { statusCode: 400 }
        );
      }
      isHoldOverride = true;
      overriddenAssociateId = property.heldByAssociateId;
    }
  }

  // Generate receipt number
  const count = await prisma.booking.count({ where: { receiptNo: { not: null } } });
  const receiptNo = `REC${String(count + 1).padStart(6, '0')}`;

  const ops = [
    prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED', receiptNo },
    }),
    prisma.property.update({
      where: { id: booking.propertyId },
      data: {
        status: 'BOOKED',
        holdExpiresAt: null,
        heldByAssociateId: null,
      },
    }),
  ];

  if (isHoldOverride) {
    ops.push(
      prisma.booking.updateMany({
        where: {
          propertyId: booking.propertyId,
          status: 'HOLD',
        },
        data: { status: 'EXPIRED' },
      })
    );
  } else {
    // If same associate is finalizing the booking, also make sure we close the hold booking
    ops.push(
      prisma.booking.updateMany({
        where: {
          propertyId: booking.propertyId,
          associateId: booking.associateId,
          status: 'HOLD',
        },
        data: { status: 'CONFIRMED' },
      })
    );
  }

  const [updated] = await prisma.$transaction(ops);

  // Send notification to the associate whose hold was overridden
  if (isHoldOverride && overriddenAssociateId) {
    (async () => {
      try {
        const tokens = await prisma.deviceToken.findMany({ where: { associateId: overriddenAssociateId } });
        const tokenList = tokens.map((t) => t.token);
        if (tokenList.length > 0) {
          await sendToDevices(tokenList, {
            title: 'Hold Overridden',
            body: `Your hold on property "${property.name}" has been overridden by a full payment purchase.`,
          }, { type: 'HOLD_OVERRIDDEN', propertyId: property.id });
        }
      } catch (err) {
        console.error('[HOLD] Push notification failed:', err.message);
      }
    })();
  }

  return updated;
}

// ─── Unapprove (Reject) Plot Booking ─────────────────────────────────────────
export async function unapprovePlotBooking(bookingId) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
  if (booking.status !== 'PENDING') throw Object.assign(new Error('Booking is not pending'), { statusCode: 400 });

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'CANCELLED' },
  });

  return updated;
}

// ─── List All Bookings (with filters) ─────────────────────────────────────────
export async function listAllBookings(filters, pagination) {
  const { startDate, endDate, customerCode, associateCode } = filters;
  const { page, pageSize, skip, take } = pagination;

  const where = {};

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59.999Z');
  }

  if (associateCode) {
    const assoc = await prisma.associate.findFirst({ where: { userId: associateCode } });
    if (assoc) where.associateId = assoc.id;
    else return { items: [], totalItems: 0, page, pageSize };
  }

  if (customerCode) {
    where.customerName = { contains: customerCode, mode: 'insensitive' };
  }

  const [items, totalItems] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        associate: { select: { userId: true, name: true, phone: true } },
        property: { select: { name: true, location: true, area: true, price: true } },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    items: items.map((b) => ({
      id: b.id,
      associateCode: b.associate.userId,
      customerCode: b.associate.userId,
      name: b.associate.name,
      projectName: b.property.name,
      approvalDate: b.status === 'CONFIRMED' ? b.updatedAt : null,
      mobile: b.associate.phone,
      customerName: b.customerName,
      customerMobile: b.customerMobile,
      customerAddress: b.customerAddress,
      plotNo: b.plotNo,
      totalSize: b.plotArea ? Number(b.plotArea) : null,
      propertyName: b.property.name,
      totalCost: b.totalCost ? Number(b.totalCost) : null,
      amount: Number(b.amount),
      remainingAmount: b.totalCost ? Number(b.totalCost) - Number(b.amount) : null,
      status: b.status,
      receiptNo: b.receiptNo,
      createdAt: b.createdAt,
    })),
    totalItems,
    page,
    pageSize,
  };
}

// ─── List Receipts (Deposited Installments) ───────────────────────────────────
export async function listReceipts(pagination) {
  const { page, pageSize, skip, take } = pagination;

  const where = { receiptNo: { not: null }, status: 'CONFIRMED' };

  const [items, totalItems] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip,
      take,
      include: {
        associate: { select: { userId: true, name: true } },
        property: { select: { name: true, location: true } },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    items: items.map((b) => ({
      id: b.id,
      receiptNo: b.receiptNo,
      associateCode: b.associate.userId,
      propertyCode: b.property.name,
      plotNo: b.plotNo,
      depositDate: b.paymentDate || b.updatedAt,
      depositAmount: Number(b.amount),
      fineAmount: 0,
      bookingAmount: Number(b.amount),
      netAmount: Number(b.totalCost || b.amount),
      status: b.status,
    })),
    totalItems,
    page,
    pageSize,
  };
}

// ─── Download Receipt (generate simple receipt data) ──────────────────────────
export async function getReceiptById(bookingId) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      associate: { select: { userId: true, name: true, phone: true, email: true, address: true } },
      property: { select: { name: true, location: true, area: true, price: true } },
    },
  });

  if (!booking) throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
  if (!booking.receiptNo) throw Object.assign(new Error('No receipt generated for this booking'), { statusCode: 400 });

  return {
    receiptNo: booking.receiptNo,
    date: booking.paymentDate || booking.updatedAt,
    associate: {
      userId: booking.associate.userId,
      name: booking.associate.name,
      phone: booking.associate.phone,
      email: booking.associate.email,
      address: booking.associate.address,
    },
    property: {
      name: booking.property.name,
      location: booking.property.location,
    },
    customer: {
      name: booking.customerName,
      mobile: booking.customerMobile,
      address: booking.customerAddress,
    },
    plotNo: booking.plotNo,
    siteNo: booking.siteNo,
    plotArea: booking.plotArea ? Number(booking.plotArea) : null,
    totalCost: booking.totalCost ? Number(booking.totalCost) : null,
    bookingAmount: Number(booking.amount),
    modeOfPayment: booking.modeOfPayment,
    chequeNo: booking.chequeNo,
    bankName: booking.bankName,
    status: booking.status,
  };
}
