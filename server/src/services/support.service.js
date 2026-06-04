import prisma from '../utils/prisma.js';

// ─── generateTicketNumber ─────────────────────────────────────────────────────

/**
 * Generate a unique sequential ticket number.
 * @returns {Promise<string>} e.g. "TKT-000001"
 */
export async function generateTicketNumber() {
  const count = await prisma.supportTicket.count();
  return `TKT-${String(count + 1).padStart(6, '0')}`;
}

// ─── createTicket ─────────────────────────────────────────────────────────────

/**
 * Create a new support ticket with an initial message.
 * @param {string} associateId
 * @param {string} subject
 * @param {string} description
 * @returns {Promise<object>} Ticket with first message
 */
export async function createTicket(associateId, subject, description) {
  const ticketNumber = await generateTicketNumber();

  const ticket = await prisma.supportTicket.create({
    data: {
      ticketNumber,
      associateId,
      subject,
      status: 'OPEN',
      messages: {
        create: {
          senderId: associateId,
          senderType: 'associate',
          message: description,
        },
      },
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return ticket;
}

// ─── getTickets ───────────────────────────────────────────────────────────────

/**
 * Return paginated support tickets for an associate.
 * @param {string} associateId
 * @param {{ page, pageSize, skip, take }} pagination
 * @returns {Promise<{ items, totalItems, page, pageSize }>}
 */
export async function getTickets(associateId, pagination = {}) {
  const { page = 1, pageSize = 20, skip = 0, take = 20 } = pagination;

  const [records, totalItems] = await Promise.all([
    prisma.supportTicket.findMany({
      where: { associateId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      select: {
        id: true,
        ticketNumber: true,
        subject: true,
        status: true,
        createdAt: true,
        _count: {
          select: { messages: true },
        },
      },
    }),
    prisma.supportTicket.count({ where: { associateId } }),
  ]);

  const items = records.map((r) => ({
    id: r.id,
    ticketNumber: r.ticketNumber,
    subject: r.subject,
    status: r.status,
    createdAt: r.createdAt,
    messageCount: r._count.messages,
  }));

  return { items, totalItems, page, pageSize };
}

// ─── getTicketById ────────────────────────────────────────────────────────────

/**
 * Fetch a single support ticket with its full message thread.
 * @param {string} associateId
 * @param {string} ticketId
 * @returns {Promise<object>} Ticket with messages
 */
export async function getTicketById(associateId, ticketId) {
  const ticket = await prisma.supportTicket.findFirst({
    where: {
      id: ticketId,
      associateId,
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!ticket) {
    throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
  }

  return ticket;
}

// ─── replyToTicket ────────────────────────────────────────────────────────────

/**
 * Add a reply message to an existing support ticket.
 * @param {string} associateId
 * @param {string} ticketId
 * @param {string} message
 * @returns {Promise<object>} Created TicketMessage
 */
export async function replyToTicket(associateId, ticketId, message) {
  // Validate ticket exists and belongs to associate
  const ticket = await prisma.supportTicket.findFirst({
    where: {
      id: ticketId,
      associateId,
    },
    select: { id: true, status: true },
  });

  if (!ticket) {
    throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
  }

  if (ticket.status === 'CLOSED' || ticket.status === 'RESOLVED') {
    throw Object.assign(
      new Error('Cannot reply to a closed or resolved ticket'),
      { statusCode: 400 },
    );
  }

  // Create message and update ticket's updatedAt atomically
  const [newMessage] = await prisma.$transaction([
    prisma.ticketMessage.create({
      data: {
        ticketId,
        senderId: associateId,
        senderType: 'associate',
        message,
      },
    }),
    prisma.supportTicket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() },
    }),
  ]);

  return newMessage;
}

// ─── Admin: list all tickets ──────────────────────────────────────────────────

export async function listAllTickets(filters = {}, pagination = {}) {
  const { status, search } = filters;
  const { page = 1, pageSize = 20, skip = 0, take = 20 } = pagination;

  const where = {};
  if (status && status !== 'ALL') {
    where.status = status;
  }
  if (search?.trim()) {
    const q = search.trim();
    where.OR = [
      { ticketNumber: { contains: q, mode: 'insensitive' } },
      { subject: { contains: q, mode: 'insensitive' } },
      {
        associate: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { userId: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        },
      },
    ];
  }

  const [records, totalItems] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip,
      take,
      select: {
        id: true,
        ticketNumber: true,
        subject: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        associate: {
          select: { id: true, userId: true, name: true, email: true, phone: true },
        },
        _count: { select: { messages: true } },
      },
    }),
    prisma.supportTicket.count({ where }),
  ]);

  const items = records.map((r) => ({
    id: r.id,
    ticketNumber: r.ticketNumber,
    subject: r.subject,
    status: r.status,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    messageCount: r._count.messages,
    associate: r.associate,
  }));

  return { items, totalItems, page, pageSize };
}

// ─── Admin: ticket detail ─────────────────────────────────────────────────────

export async function getTicketByIdAdmin(ticketId) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      associate: {
        select: { id: true, userId: true, name: true, email: true, phone: true },
      },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!ticket) {
    throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
  }

  return ticket;
}

// ─── Admin: reply ─────────────────────────────────────────────────────────────

export async function adminReplyToTicket(adminId, ticketId, message) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: { id: true, status: true },
  });

  if (!ticket) {
    throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
  }

  if (ticket.status === 'CLOSED') {
    throw Object.assign(new Error('Cannot reply to a closed ticket'), { statusCode: 400 });
  }

  let nextStatus = ticket.status;
  if (ticket.status === 'OPEN' || ticket.status === 'RESOLVED') {
    nextStatus = 'IN_PROGRESS';
  }

  await prisma.$transaction([
    prisma.ticketMessage.create({
      data: {
        ticketId,
        senderId: adminId,
        senderType: 'admin',
        message,
      },
    }),
    prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: nextStatus, updatedAt: new Date() },
    }),
  ]);

  return getTicketByIdAdmin(ticketId);
}

// ─── Admin: update status ─────────────────────────────────────────────────────

const VALID_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export async function updateTicketStatus(ticketId, status) {
  if (!VALID_STATUSES.includes(status)) {
    throw Object.assign(new Error('Invalid ticket status'), { statusCode: 400 });
  }

  const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
  }

  return prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status },
    include: {
      associate: {
        select: { id: true, userId: true, name: true, email: true, phone: true },
      },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });
}
