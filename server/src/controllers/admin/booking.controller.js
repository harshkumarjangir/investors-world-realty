import * as bookingService from '../../services/admin/booking.service.js';
import { successResponse, paginatedResponse, parsePagination } from '../../utils/response.js';

export async function createBookingHandler(req, res, next) {
  try {
    const result = await bookingService.createPlotBooking(req.body);
    return successResponse(res, result, 'Plot booking created successfully', 201);
  } catch (e) { return next(e); }
}

export async function listUnapprovedHandler(req, res, next) {
  try {
    const pagination = parsePagination(req.query);
    const result = await bookingService.listUnapprovedBookings(pagination);
    return paginatedResponse(res, result.items, result.totalItems, result.page, result.pageSize);
  } catch (e) { return next(e); }
}

export async function approveBookingHandler(req, res, next) {
  try {
    const result = await bookingService.approvePlotBooking(req.params.id);
    return successResponse(res, result, 'Booking approved');
  } catch (e) { return next(e); }
}

export async function unapproveBookingHandler(req, res, next) {
  try {
    const result = await bookingService.unapprovePlotBooking(req.params.id);
    return successResponse(res, result, 'Booking rejected');
  } catch (e) { return next(e); }
}

export async function listAllBookingsHandler(req, res, next) {
  try {
    const pagination = parsePagination(req.query);
    const { startDate, endDate, customerCode, associateCode } = req.query;
    const result = await bookingService.listAllBookings({ startDate, endDate, customerCode, associateCode }, pagination);
    return paginatedResponse(res, result.items, result.totalItems, result.page, result.pageSize);
  } catch (e) { return next(e); }
}

export async function listReceiptsHandler(req, res, next) {
  try {
    const pagination = parsePagination(req.query);
    const result = await bookingService.listReceipts(pagination);
    return paginatedResponse(res, result.items, result.totalItems, result.page, result.pageSize);
  } catch (e) { return next(e); }
}

export async function getReceiptHandler(req, res, next) {
  try {
    const result = await bookingService.getReceiptById(req.params.id);
    return successResponse(res, result, 'Receipt fetched');
  } catch (e) { return next(e); }
}
