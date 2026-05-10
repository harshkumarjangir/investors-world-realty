import {
  getDashboard,
  getAdvancePayment,
  getReferralLink,
  getReferralQR,
} from '../services/dashboard.service.js';
import { successResponse } from '../utils/response.js';

export async function getDashboardHandler(req, res, next) {
  try {
    const data = await getDashboard(req.associate.id);
    return successResponse(res, data, 'Dashboard data retrieved');
  } catch (err) {
    return next(err);
  }
}

export async function getAdvancePaymentHandler(req, res, next) {
  try {
    const data = await getAdvancePayment(req.associate.id);
    return successResponse(res, data, 'Advance payment data retrieved');
  } catch (err) {
    return next(err);
  }
}

export async function getReferralLinkHandler(req, res, next) {
  try {
    const data = await getReferralLink(req.associate.id);
    return successResponse(res, data, 'Referral link retrieved');
  } catch (err) {
    return next(err);
  }
}

export async function getReferralQRHandler(req, res, next) {
  try {
    const data = await getReferralQR(req.associate.id);
    return successResponse(res, data, 'Referral QR code generated');
  } catch (err) {
    return next(err);
  }
}
