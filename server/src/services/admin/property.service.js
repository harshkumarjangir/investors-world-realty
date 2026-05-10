import prisma from '../../utils/prisma.js';
import { logAdminAction } from '../../middleware/auditLog.js';
import { sendNotificationToAll } from '../notification.service.js';

// ─── adminCreateProperty ──────────────────────────────────────────────────────

/**
 * Create a new property.
 * @param {object} data - { name, description, location, city, state, area, price, type, amenities }
 * @returns {Promise<object>} Created Property record
 */
export async function adminCreateProperty(data) {
  const { name, description, location, city, state, area, price, type, amenities } = data;

  const property = await prisma.property.create({
    data: {
      name,
      description,
      location,
      city,
      state,
      area: Number(area),
      price: Number(price),
      type,
      amenities: Array.isArray(amenities) ? amenities : [],
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
          url: file.path,
          sortOrder: existingCount + index,
        },
      }),
    ),
  );

  return images;
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
      url: file.path,
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

  const allowedFields = ['name', 'description', 'location', 'city', 'state', 'area', 'price', 'type', 'amenities', 'isFeatured'];
  const updateData = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      if (field === 'area' || field === 'price') {
        updateData[field] = Number(data[field]);
      } else if (field === 'amenities') {
        updateData[field] = Array.isArray(data[field]) ? data[field] : [];
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
  const validStatuses = ['AVAILABLE', 'BOOKED', 'SOLD'];
  if (!validStatuses.includes(status)) {
    throw Object.assign(new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`), { statusCode: 400 });
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId, deletedAt: null },
    select: { id: true, name: true, status: true },
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

  // Send FCM notification to all users when property becomes AVAILABLE or BOOKED
  if (status === 'AVAILABLE' || status === 'BOOKED') {
    const notifTitle = status === 'AVAILABLE' ? 'Property Now Available' : 'Property Update';
    const notifMessage = status === 'AVAILABLE'
      ? `${property.name} is now available for booking.`
      : `${property.name} has been booked.`;

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
