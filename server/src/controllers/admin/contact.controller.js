import prisma from '../../utils/prisma.js';
import { paginatedResponse, successResponse, parsePagination } from '../../utils/response.js';

export async function listContactInquiriesHandler(req, res, next) {
  try {
    const { page, pageSize, skip, take } = parsePagination(req.query);
    const [items, totalItems] = await Promise.all([
      prisma.contactInquiry.findMany({ orderBy: { createdAt: 'desc' }, skip, take }),
      prisma.contactInquiry.count(),
    ]);
    return paginatedResponse(res, items, totalItems, page, pageSize);
  } catch (e) { return next(e); }
}

export async function getContactInquiryHandler(req, res, next) {
  try {
    const inquiry = await prisma.contactInquiry.findUnique({ where: { id: req.params.id } });
    if (!inquiry) return res.status(404).json({ status: 'error', message: 'Not found', data: null });
    return successResponse(res, inquiry);
  } catch (e) { return next(e); }
}
