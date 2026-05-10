import {
  getTree,
  getDownline,
  getSponsor,
  getTeamSummary,
} from '../services/genealogy.service.js';
import { successResponse, errorResponse, paginatedResponse, parsePagination } from '../utils/response.js';

// ─── GET /tree?depth=5 ────────────────────────────────────────────────────────
export async function getTreeHandler(req, res) {
  try {
    const associateId = req.associate.id;
    const depth = req.query.depth ? parseInt(req.query.depth, 10) : 5;

    const tree = await getTree(associateId, depth);
    return successResponse(res, tree, 'Tree fetched successfully');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}

// ─── GET /downline ────────────────────────────────────────────────────────────
export async function getDownlineHandler(req, res) {
  try {
    const associateId = req.associate.id;
    const { status, leg, level } = req.query;
    const pagination = parsePagination(req.query);

    const { items, totalItems, page, pageSize } = await getDownline(
      associateId,
      { status, leg, level },
      pagination,
    );

    return paginatedResponse(res, items, totalItems, page, pageSize, 'Downline fetched successfully');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}

// ─── GET /sponsor ─────────────────────────────────────────────────────────────
export async function getSponsorHandler(req, res) {
  try {
    const associateId = req.associate.id;
    const sponsor = await getSponsor(associateId);
    return successResponse(res, sponsor, 'Sponsor fetched successfully');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}

// ─── GET /team-summary ────────────────────────────────────────────────────────
export async function getTeamSummaryHandler(req, res) {
  try {
    const associateId = req.associate.id;
    const summary = await getTeamSummary(associateId);
    return successResponse(res, summary, 'Team summary fetched successfully');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}
