import {
  adminCreateProperty,
  adminUploadPropertyImages,
  adminUploadPropertyVideo,
  adminEditProperty,
  adminUpdatePropertyStatus,
  adminSoftDeleteProperty,
  adminGetPropertyInquiries,
} from '../../services/admin/property.service.js';
import prisma from '../../utils/prisma.js';
import { successResponse, createdResponse, paginatedResponse, parsePagination } from '../../utils/response.js';

export async function listPropertiesAdminHandler(req, res, next) {
  try {
    const { location, type, status } = req.query;
    const pagination = parsePagination(req.query);

    const where = {};
    if (location) where.city = { contains: location, mode: 'insensitive' };
    if (type) where.type = type;
    if (status) where.status = status;
    // Admin sees all properties including soft-deleted

    const [totalItems, properties] = await Promise.all([
      prisma.property.count({ where }),
      prisma.property.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
        include: {
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
        },
      }),
    ]);

    const items = properties.map((p) => ({
      id: p.id,
      name: p.name,
      location: p.location,
      city: p.city,
      state: p.state,
      area: Number(p.area),
      price: Number(p.price),
      type: p.type,
      status: p.status,
      isFeatured: p.isFeatured,
      thumbnail: p.images[0]?.url || null,
      createdAt: p.createdAt,
    }));

    return paginatedResponse(res, items, totalItems, pagination.page, pagination.pageSize, 'Properties fetched');
  } catch (err) {
    return next(err);
  }
}

export async function createPropertyHandler(req, res, next) {
  try {
    const { name, description, location, city, state, area, price, type, amenities } = req.body;

    if (!name || !description || !location || !city || !state || !area || !price || !type) {
      return res.status(400).json({ status: 'error', message: 'name, description, location, city, state, area, price, and type are required', data: null });
    }

    const property = await adminCreateProperty({ name, description, location, city, state, area, price, type, amenities });
    return createdResponse(res, property, 'Property created successfully');
  } catch (err) {
    return next(err);
  }
}

export async function uploadPropertyImagesHandler(req, res, next) {
  try {
    const { id } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ status: 'error', message: 'At least one image file is required', data: null });
    }

    const images = await adminUploadPropertyImages(id, files);
    return createdResponse(res, images, 'Images uploaded successfully');
  } catch (err) {
    return next(err);
  }
}

export async function uploadPropertyVideoHandler(req, res, next) {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ status: 'error', message: 'A video file is required', data: null });
    }

    const video = await adminUploadPropertyVideo(id, file);
    return createdResponse(res, video, 'Video uploaded successfully');
  } catch (err) {
    return next(err);
  }
}

export async function editPropertyHandler(req, res, next) {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;
    const updated = await adminEditProperty(id, req.body, adminId);
    return successResponse(res, updated, 'Property updated successfully');
  } catch (err) {
    return next(err);
  }
}

export async function updatePropertyStatusHandler(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = req.admin.id;

    if (!status) {
      return res.status(400).json({ status: 'error', message: 'status is required', data: null });
    }

    const updated = await adminUpdatePropertyStatus(id, status, adminId);
    return successResponse(res, updated, 'Property status updated successfully');
  } catch (err) {
    return next(err);
  }
}

export async function deletePropertyHandler(req, res, next) {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;
    await adminSoftDeleteProperty(id, adminId);
    return successResponse(res, null, 'Property deleted successfully');
  } catch (err) {
    return next(err);
  }
}

export async function getPropertyInquiriesHandler(req, res, next) {
  try {
    const { id } = req.params;
    const pagination = parsePagination(req.query);
    const result = await adminGetPropertyInquiries(id, pagination);
    return paginatedResponse(res, result.items, result.totalItems, result.page, result.pageSize, 'Property inquiries');
  } catch (err) {
    return next(err);
  }
}
