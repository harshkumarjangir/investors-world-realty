import {
  getIncomeSummary,
  getIncomeHistory,
} from '../services/income.service.js';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  parsePagination,
} from '../utils/response.js';

// ─── GET /summary ─────────────────────────────────────────────────────────────
export async function getIncomeSummaryHandler(req, res) {
  try {
    const associateId = req.associate.id;
    const summary = await getIncomeSummary(associateId);
    return successResponse(res, summary, 'Income summary fetched successfully');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}

// ─── GET /history ─────────────────────────────────────────────────────────────
export async function getIncomeHistoryHandler(req, res) {
  try {
    const associateId = req.associate.id;
    const pagination = parsePagination(req.query);

    const { items, totalItems, page, pageSize } = await getIncomeHistory(associateId, pagination);
    return paginatedResponse(res, items, totalItems, page, pageSize, 'Income history fetched successfully');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}

