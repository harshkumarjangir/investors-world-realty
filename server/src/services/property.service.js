import prisma from '../utils/prisma.js';
import { sendToTopic } from '../utils/firebase.js';

// ─── List Properties ──────────────────────────────────────────────────────────
export async function listProperties(filters = {}, pagination = {}) {
  const { location, minPrice, maxPrice, type, status, schemeId } = filters;
  const { skip = 0, take = 20, page = 1, pageSize = 20 } = pagination;

  const where = {
    deletedAt: null,
    ...(status ? { status } : { status: { in: ['AVAILABLE', 'HOLD'] } }),
    ...(type ? { type } : {}),
    ...(location
      ? {
          OR: [
            { location: { contains: location, mode: 'insensitive' } },
            { city: { contains: location, mode: 'insensitive' } },
            { state: { contains: location, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(minPrice || maxPrice
      ? {
          price: {
            ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
            ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
          },
        }
      : {}),
    ...(schemeId ? { schemeId } : {}),
  };

  const [totalItems, properties] = await Promise.all([
    prisma.property.count({ where }),
    prisma.property.findMany({
      where,
      skip,
      take,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        schemeId: true,
        name: true,
        location: true,
        city: true,
        state: true,
        price: true,
        type: true,
        status: true,
        isFeatured: true,
        scheme: { select: { id: true, schemeName: true, schemeType: true } },
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
          select: { url: true },
        },
      },
    }),
  ]);

  const items = properties.map((p) => ({
    id: p.id,
    schemeId: p.schemeId,
    schemeName: p.scheme?.schemeName || null,
    schemeType: p.scheme?.schemeType || null,
    name: p.name,
    location: p.location,
    city: p.city,
    state: p.state,
    price: p.price,
    type: p.type,
    status: p.status,
    isFeatured: p.isFeatured,
    iwrCoinPrice: p.price ? p.price / 100 : 0,
    thumbnail: p.images.length > 0 ? p.images[0].url : null,
  }));

  return { items, totalItems, page, pageSize };
}

// ─── Get Property By ID ───────────────────────────────────────────────────────
export async function getPropertyById(propertyId) {
  const property = await prisma.property.findFirst({
    where: { id: propertyId, deletedAt: null },
    include: {
      scheme: { select: { id: true, schemeName: true, city: true, state: true, address: true, schemeType: true } },
      images: { orderBy: { sortOrder: 'asc' } },
      videos: { orderBy: { createdAt: 'asc' } },
      bookings: {
        where: { status: { not: 'CANCELLED' } },
        select: { id: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!property) {
    const err = new Error('Property not found');
    err.statusCode = 404;
    throw err;
  }

  return {
    ...property,
    iwrCoinPrice: property.price ? property.price / 100 : 0,
    bookingStatus: property.bookings.length > 0 ? property.bookings[0].status : null,
    bookings: undefined,
  };
}

// ─── Submit Inquiry ───────────────────────────────────────────────────────────
export async function submitInquiry(associateId, propertyId, message) {
  // Validate property exists and is not deleted
  const property = await prisma.property.findFirst({
    where: { id: propertyId, deletedAt: null },
    select: { id: true, name: true },
  });

  if (!property) {
    const err = new Error('Property not found');
    err.statusCode = 404;
    throw err;
  }

  const inquiry = await prisma.propertyInquiry.create({
    data: {
      propertyId,
      associateId,
      message,
    },
  });

  // Send push notification to admins via FCM topic
  try {
    await sendToTopic('admin_notifications', {
      title: 'New Property Inquiry',
      body: `New inquiry received for property: ${property.name}`,
    }, {
      type: 'PROPERTY_INQUIRY',
      propertyId,
      inquiryId: inquiry.id,
    });
  } catch (err) {
    // Non-fatal — log and continue
    console.warn('[INQUIRY] Failed to send admin push notification:', err.message);
  }

  return inquiry;
}
