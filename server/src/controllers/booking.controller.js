import {
  createBooking,
  getBookings,
} from '../services/booking.service.js';
import {
  createdResponse,
  errorResponse,
  paginatedResponse,
  parsePagination,
} from '../utils/response.js';

// ─── POST /:id/book ───────────────────────────────────────────────────────────
export async function createBookingHandler(req, res) {
  try {
    const associateId = req.associate.id;
    const propertyId = req.params.id;
    const { amount } = req.body;

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return errorResponse(res, 'amount must be a positive number', 400);
    }

    const booking = await createBooking(associateId, propertyId, parsedAmount);
    return createdResponse(res, booking, 'Booking created successfully');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}

// ─── GET /bookings ────────────────────────────────────────────────────────────
export async function getBookingsHandler(req, res) {
  try {
    const associateId = req.associate.id;
    const pagination = parsePagination(req.query);

    const { items, totalItems, page, pageSize } = await getBookings(associateId, pagination);
    return paginatedResponse(res, items, totalItems, page, pageSize, 'Bookings fetched successfully');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}
