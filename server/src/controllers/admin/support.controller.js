import {
  listAllTickets,
  getTicketByIdAdmin,
  adminReplyToTicket,
  updateTicketStatus,
} from '../../services/support.service.js';
import {
  successResponse,
  createdResponse,
  paginatedResponse,
  parsePagination,
} from '../../utils/response.js';

export async function listSupportTicketsHandler(req, res, next) {
  try {
    const pagination = parsePagination(req.query);
    const { status, search } = req.query;
    const result = await listAllTickets({ status, search }, pagination);
    return paginatedResponse(
      res,
      result.items,
      result.totalItems,
      result.page,
      result.pageSize,
      'Support tickets retrieved',
    );
  } catch (e) {
    return next(e);
  }
}

export async function getSupportTicketHandler(req, res, next) {
  try {
    const ticket = await getTicketByIdAdmin(req.params.id);
    return successResponse(res, ticket, 'Ticket retrieved');
  } catch (e) {
    return next(e);
  }
}

export async function replySupportTicketHandler(req, res, next) {
  try {
    const { message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ status: 'error', message: 'Message is required', data: null });
    }
    const ticket = await adminReplyToTicket(req.admin.id, req.params.id, message.trim());
    return createdResponse(res, ticket, 'Reply sent');
  } catch (e) {
    return next(e);
  }
}

export async function updateSupportTicketStatusHandler(req, res, next) {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ status: 'error', message: 'Status is required', data: null });
    }
    const ticket = await updateTicketStatus(req.params.id, status);
    return successResponse(res, ticket, 'Ticket status updated');
  } catch (e) {
    return next(e);
  }
}
