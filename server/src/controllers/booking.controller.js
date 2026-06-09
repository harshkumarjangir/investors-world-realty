import {
  createBooking,
  getBookings,
  holdProperty,
  initiatePropertyPayment,
  verifyPropertyPayment,
} from '../services/booking.service.js';
import {
  successResponse,
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

// ─── POST /:id/hold ───────────────────────────────────────────────────────────
export async function holdPropertyHandler(req, res) {
  try {
    const associateId = req.associate.id;
    const propertyId = req.params.id;
    const { customerName, customerMobile, customerAddress } = req.body;

    const booking = await holdProperty(associateId, propertyId, {
      customerName,
      customerMobile,
      customerAddress,
    });
    return createdResponse(res, booking, 'Property placed on hold successfully');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}

// ─── POST /:id/payment/initiate ──────────────────────────────────────────────
export async function initiatePropertyPaymentHandler(req, res) {
  try {
    const associateId = req.associate.id;
    const propertyId = req.params.id;
    const { amount, customerName, customerMobile, customerAddress } = req.body;

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return errorResponse(res, 'amount must be a positive number', 400);
    }

    const orderData = await initiatePropertyPayment(associateId, propertyId, {
      amount: parsedAmount,
      customerName,
      customerMobile,
      customerAddress,
    });
    return successResponse(res, orderData, 'Payment initiated successfully');
  } catch (err) {
    const message = err.error?.description || err.message || 'An error occurred';
    return errorResponse(res, message, err.statusCode || 500);
  }
}

// ─── POST /payment/verify ────────────────────────────────────────────────────
export async function verifyPropertyPaymentHandler(req, res) {
  try {
    const associateId = req.associate.id;
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return errorResponse(res, 'razorpayOrderId, razorpayPaymentId, and razorpaySignature are required', 400);
    }

    const booking = await verifyPropertyPayment(associateId, {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });
    return successResponse(res, booking, 'Payment verified and booking confirmed successfully');
  } catch (err) {
    const message = err.error?.description || err.message || 'An error occurred';
    return errorResponse(res, message, err.statusCode || 500);
  }
}


