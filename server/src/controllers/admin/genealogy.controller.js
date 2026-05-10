import {
  adminGetTree,
  adminSearchAssociate,
  adminGetLevelAnalysis,
  adminGetBusinessTracking,
} from '../../services/admin/genealogy.service.js';
import { successResponse } from '../../utils/response.js';

export async function getTreeHandler(req, res, next) {
  try {
    const { associateId } = req.params;
    const depth = req.query.depth ? parseInt(req.query.depth, 10) : 5;
    const data = await adminGetTree(associateId, depth);
    return successResponse(res, data, 'Tree retrieved');
  } catch (err) {
    return next(err);
  }
}

export async function searchAssociateHandler(req, res, next) {
  try {
    const data = await adminSearchAssociate(req.query.q);
    return successResponse(res, data, 'Search results retrieved');
  } catch (err) {
    return next(err);
  }
}

export async function getLevelAnalysisHandler(req, res, next) {
  try {
    const data = await adminGetLevelAnalysis();
    return successResponse(res, data, 'Level analysis retrieved');
  } catch (err) {
    return next(err);
  }
}

export async function getBusinessTrackingHandler(req, res, next) {
  try {
    const data = await adminGetBusinessTracking(req.params.associateId);
    return successResponse(res, data, 'Business tracking data retrieved');
  } catch (err) {
    return next(err);
  }
}
