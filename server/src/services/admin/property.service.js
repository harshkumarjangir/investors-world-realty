import prisma from '../../utils/prisma.js';
import { logAdminAction } from '../../middleware/auditLog.js';
import { sendNotificationToAll } from '../notification.service.js';

// ─── adminCreateProperty ──────────────────────────────────────────────────────

/**
 * Create a new property.
 * @param {object} data - { name, description, location, city, state, area, price, type, amenities }
 * @returns {Promise<object>} Created Property record
 */
function parseAmenities(amenities) {
  if (Array.isArray(amenities)) return amenities;
  if (typeof amenities === 'string' && amenities.trim()) {
    return amenities.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export async function adminCreateProperty(data) {
  const { schemeId, name, description, location, city, state, area, price, type, amenities, bookingMinAmount, bookingMaxAmount, plotTypeId, plotSizeUnit, plotNo, plcId, chargeOfPlot, totalCostOfPlot } = data;

  if (!schemeId) {
    throw Object.assign(new Error('schemeId is required — select a scheme first'), { statusCode: 400 });
  }

  const scheme = await prisma.scheme.findUnique({ where: { id: schemeId } });
  if (!scheme) {
    throw Object.assign(new Error('Scheme not found'), { statusCode: 404 });
  }

  const property = await prisma.property.create({
    data: {
      schemeId,
      name,
      description,
      location: location || scheme.address,
      city: city || scheme.city || '',
      state: state || scheme.state || '',
      area: Number(area),
      price: Number(price),
      type,
      amenities: parseAmenities(amenities),
      bookingMinAmount: bookingMinAmount ? Number(bookingMinAmount) : null,
      bookingMaxAmount: bookingMaxAmount ? Number(bookingMaxAmount) : null,
      plotTypeId: plotTypeId || null,
      plotSizeUnit: plotSizeUnit || null,
      plotNo: plotNo || null,
      plcId: plcId || null,
      chargeOfPlot: Number(chargeOfPlot) || 0,
      totalCostOfPlot: totalCostOfPlot ? Number(totalCostOfPlot) : null,
    },
    include: {
      scheme: { select: { id: true, schemeName: true, city: true, state: true } },
    },
  });

  return property;
}

// ─── adminUploadPropertyImages ────────────────────────────────────────────────

/**
 * Upload images for a property. Max 10 total (existing + new).
 * @param {string} propertyId
 * @param {Array} files - multer file objects
 * @returns {Promise<Array>} Created PropertyImage records
 */
export async function adminUploadPropertyImages(propertyId, files) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId, deletedAt: null },
    select: { id: true },
  });

  if (!property) {
    throw Object.assign(new Error('Property not found'), { statusCode: 404 });
  }

  const existingCount = await prisma.propertyImage.count({ where: { propertyId } });

  if (existingCount + files.length > 10) {
    throw Object.assign(
      new Error(`Cannot upload ${files.length} image(s). Maximum 10 images allowed (currently ${existingCount}).`),
      { statusCode: 400 },
    );
  }

  const images = await prisma.$transaction(
    files.map((file, index) =>
      prisma.propertyImage.create({
        data: {
          propertyId,
          url: file.path.replace(/\\/g, '/'),
          sortOrder: existingCount + index,
        },
      }),
    ),
  );

  return images;
}

// ─── adminDeletePropertyImage ───────────────────────────────────────────────────

export async function adminDeletePropertyImage(propertyId, imageId) {
  const image = await prisma.propertyImage.findUnique({
    where: { id: imageId },
  });

  if (!image || image.propertyId !== propertyId) {
    throw Object.assign(new Error('Image not found'), { statusCode: 404 });
  }

  await prisma.propertyImage.delete({
    where: { id: imageId },
  });

  // Optionally delete file from disk if it starts with 'uploads/'
  if (image.url.startsWith('uploads/')) {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), image.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  return true;
}

// ─── adminUploadPropertyVideo ─────────────────────────────────────────────────

/**
 * Upload a video for a property.
 * @param {string} propertyId
 * @param {object} file - multer file object
 * @returns {Promise<object>} Created PropertyVideo record
 */
export async function adminUploadPropertyVideo(propertyId, file) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId, deletedAt: null },
    select: { id: true },
  });

  if (!property) {
    throw Object.assign(new Error('Property not found'), { statusCode: 404 });
  }

  const ext = file.originalname.split('.').pop().toLowerCase();
  const format = ext === 'mov' ? 'mov' : 'mp4';

  const video = await prisma.propertyVideo.create({
    data: {
      propertyId,
      url: file.path.replace(/\\/g, '/'),
      format,
    },
  });

  return video;
}

// ─── adminEditProperty ────────────────────────────────────────────────────────

/**
 * Update allowed fields on a property.
 * @param {string} propertyId
 * @param {object} data - fields to update
 * @param {string} adminId
 * @returns {Promise<object>} Updated Property record
 */
export async function adminEditProperty(propertyId, data, adminId) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId, deletedAt: null },
    select: { id: true },
  });

  if (!property) {
    throw Object.assign(new Error('Property not found'), { statusCode: 404 });
  }

  const allowedFields = ['schemeId', 'name', 'description', 'location', 'city', 'state', 'area', 'price', 'type', 'amenities', 'isFeatured', 'bookingMinAmount', 'bookingMaxAmount', 'plotTypeId', 'plotSizeUnit', 'plotNo', 'plcId', 'chargeOfPlot', 'totalCostOfPlot'];
  const updateData = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      if (field === 'area' || field === 'price' || field === 'bookingMinAmount' || field === 'bookingMaxAmount' || field === 'chargeOfPlot' || field === 'totalCostOfPlot') {
        updateData[field] = data[field] ? Number(data[field]) : null;
      } else if (field === 'amenities') {
        updateData[field] = parseAmenities(data[field]);
      } else if (field === 'schemeId') {
        if (!data[field]) {
          throw Object.assign(new Error('schemeId cannot be empty'), { statusCode: 400 });
        }
        const scheme = await prisma.scheme.findUnique({ where: { id: data[field] } });
        if (!scheme) {
          throw Object.assign(new Error('Scheme not found'), { statusCode: 404 });
        }
        updateData[field] = data[field];
      } else {
        updateData[field] = data[field];
      }
    }
  }

  const updated = await prisma.property.update({
    where: { id: propertyId },
    data: updateData,
  });

  await logAdminAction(adminId, 'UPDATE_PROPERTY', 'Property', propertyId, { updatedFields: Object.keys(updateData) });

  return updated;
}

// ─── adminUpdatePropertyStatus ────────────────────────────────────────────────

/**
 * Update property status. Sends FCM notification on AVAILABLE or BOOKED.
 * @param {string} propertyId
 * @param {string} status - PropertyStatus enum value
 * @param {string} adminId
 * @returns {Promise<object>} Updated Property record
 */
export async function adminUpdatePropertyStatus(propertyId, status, adminId) {
  const validStatuses = ['AVAILABLE', 'HOLD', 'BOOKED', 'SOLD'];
  if (!validStatuses.includes(status)) {
    throw Object.assign(new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`), { statusCode: 400 });
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId, deletedAt: null },
    select: { id: true, name: true, status: true, price: true, area: true },
  });

  if (!property) {
    throw Object.assign(new Error('Property not found'), { statusCode: 404 });
  }

  const updated = await prisma.property.update({
    where: { id: propertyId },
    data: { status },
  });

  await logAdminAction(adminId, 'UPDATE_PROPERTY_STATUS', 'Property', propertyId, {
    previousStatus: property.status,
    newStatus: status,
  });

  // Calculate property sale commission (10-level upline chain) if transitioned to SOLD
  if (status === 'SOLD' && property.status !== 'SOLD') {
    try {
      const booking = await prisma.booking.findFirst({
        where: { propertyId, status: 'CONFIRMED' },
        orderBy: { createdAt: 'desc' },
      });
      if (booking) {
        const { calculatePropertySaleCommission } = await import('../propertyCommission.service.js');
        await calculatePropertySaleCommission(
          booking.associateId,
          propertyId,
          booking.id,
          Number(updated.price),
          Number(updated.area),
        );
      } else {
        console.warn(`[COMMISSION] No confirmed booking found for sold property ${propertyId}. Commission not calculated.`);
      }
    } catch (err) {
      console.error('[COMMISSION] Property sale commission calculation failed:', err.message);
    }
  }

  // Send FCM notification to all users when property becomes AVAILABLE, BOOKED or SOLD
  if (status === 'AVAILABLE' || status === 'BOOKED' || status === 'SOLD') {
    const notifTitle = status === 'AVAILABLE' ? 'Property Now Available' : (status === 'SOLD' ? 'Property Sold' : 'Property Update');
    const notifMessage = status === 'AVAILABLE'
      ? `${property.name} is now available for booking.`
      : (status === 'SOLD' ? `${property.name} has been sold.` : `${property.name} has been booked.`);

    // Fire-and-forget
    sendNotificationToAll(notifTitle, notifMessage, 'PROPERTY', { propertyId, status }).catch((err) => {
      console.error('[PROPERTY] Broadcast notification failed:', err.message);
    });
  }

  return updated;
}

// ─── adminSoftDeleteProperty ──────────────────────────────────────────────────

/**
 * Soft-delete a property by setting deletedAt.
 * @param {string} propertyId
 * @param {string} adminId
 * @returns {Promise<object>} Updated Property record
 */
export async function adminSoftDeleteProperty(propertyId, adminId) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId, deletedAt: null },
    select: { id: true },
  });

  if (!property) {
    throw Object.assign(new Error('Property not found'), { statusCode: 404 });
  }

  const deleted = await prisma.property.update({
    where: { id: propertyId },
    data: { deletedAt: new Date() },
  });

  await logAdminAction(adminId, 'DELETE_PROPERTY', 'Property', propertyId);

  return deleted;
}

// ─── adminGetPropertyInquiries ────────────────────────────────────────────────

/**
 * Return paginated PropertyInquiry records for a property.
 * @param {string} propertyId
 * @param {{ page, pageSize, skip, take }} pagination
 */
export async function adminGetPropertyInquiries(propertyId, pagination) {
  const { page, pageSize, skip, take } = pagination;

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true },
  });

  if (!property) {
    throw Object.assign(new Error('Property not found'), { statusCode: 404 });
  }

  const [records, totalItems] = await Promise.all([
    prisma.propertyInquiry.findMany({
      where: { propertyId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      select: {
        id: true,
        message: true,
        createdAt: true,
        associateId: true,
      },
    }),
    prisma.propertyInquiry.count({ where: { propertyId } }),
  ]);

  // Fetch associate info
  const associateIds = [...new Set(records.map((r) => r.associateId))];
  const associates = await prisma.associate.findMany({
    where: { id: { in: associateIds } },
    select: { id: true, userId: true, name: true },
  });
  const associateMap = Object.fromEntries(associates.map((a) => [a.id, a]));

  const items = records.map((r) => ({
    id: r.id,
    message: r.message,
    createdAt: r.createdAt,
    userId: associateMap[r.associateId]?.userId ?? null,
    name: associateMap[r.associateId]?.name ?? null,
  }));

  return { items, totalItems, page, pageSize };
}
