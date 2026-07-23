import {
  listProperties,
  getPropertyById,
  submitInquiry,
} from '../services/property.service.js';
import {
  successResponse,
  createdResponse,
  errorResponse,
  paginatedResponse,
  parsePagination,
} from '../utils/response.js';

// ─── GET / — List properties with filters ────────────────────────────────────
export async function listPropertiesHandler(req, res) {
  try {
    const { location, minPrice, maxPrice, type, status, schemeId } = req.query;
    const pagination = parsePagination(req.query);

    const filters = {
      ...(location ? { location } : {}),
      ...(minPrice ? { minPrice } : {}),
      ...(maxPrice ? { maxPrice } : {}),
      ...(type ? { type } : {}),
      ...(status ? { status } : {}),
      ...(schemeId ? { schemeId } : {}),
    };

    const { items, totalItems, page, pageSize } = await listProperties(filters, pagination);
    return paginatedResponse(res, items, totalItems, page, pageSize, 'Properties fetched successfully');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}

// ─── GET /:id — Get property details ─────────────────────────────────────────
export async function getPropertyByIdHandler(req, res) {
  try {
    const { id } = req.params;
    const property = await getPropertyById(id);
    return successResponse(res, property, 'Property fetched successfully');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}

// ─── POST /:id/inquiry — Submit inquiry ──────────────────────────────────────
export async function submitInquiryHandler(req, res) {
  try {
    const associateId = req.associate.id;
    const propertyId = req.params.id;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return errorResponse(res, 'message is required', 400);
    }

    const inquiry = await submitInquiry(associateId, propertyId, message.trim());
    return createdResponse(res, inquiry, 'Inquiry submitted successfully');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}
