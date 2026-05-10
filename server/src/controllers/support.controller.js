import {
  createTicket,
  getTickets,
  getTicketById,
  replyToTicket,
} from '../services/support.service.js';
import {
  successResponse,
  createdResponse,
  parsePagination,
  paginatedResponse,
} from '../utils/response.js';

// ─── createTicketHandler ──────────────────────────────────────────────────────

export async function createTicketHandler(req, res, next) {
  try {
    const { subject, description } = req.body;

    if (!subject || !subject.trim()) {
      return res.status(400).json({ status: 'error', message: 'Subject is required', data: null });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ status: 'error', message: 'Description is required', data: null });
    }

    const ticket = await createTicket(req.associate.id, subject.trim(), description.trim());
    return createdResponse(res, ticket, 'Support ticket created');
  } catch (err) {
    return next(err);
  }
}

// ─── getTicketsHandler ────────────────────────────────────────────────────────

export async function getTicketsHandler(req, res, next) {
  try {
    const pagination = parsePagination(req.query);
    const { items, totalItems, page, pageSize } = await getTickets(req.associate.id, pagination);
    return paginatedResponse(res, items, totalItems, page, pageSize, 'Tickets retrieved');
  } catch (err) {
    return next(err);
  }
}

// ─── getTicketByIdHandler ─────────────────────────────────────────────────────

export async function getTicketByIdHandler(req, res, next) {
  try {
    const ticket = await getTicketById(req.associate.id, req.params.id);
    return successResponse(res, ticket, 'Ticket retrieved');
  } catch (err) {
    return next(err);
  }
}

// ─── replyToTicketHandler ─────────────────────────────────────────────────────

export async function replyToTicketHandler(req, res, next) {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ status: 'error', message: 'Message is required', data: null });
    }

    const newMessage = await replyToTicket(req.associate.id, req.params.id, message.trim());
    return createdResponse(res, newMessage, 'Reply sent');
  } catch (err) {
    return next(err);
  }
}
