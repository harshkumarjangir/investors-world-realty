import { calculateEMI, getEMISchedule } from '../services/emi.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

// ─── POST /emi-calculator ─────────────────────────────────────────────────────
export async function calculateEMIHandler(req, res) {
  try {
    const { principal, annualRate, tenureMonths } = req.body;

    if (principal === undefined || principal === null) {
      return errorResponse(res, 'principal is required', 400);
    }
    if (annualRate === undefined || annualRate === null) {
      return errorResponse(res, 'annualRate is required', 400);
    }
    if (tenureMonths === undefined || tenureMonths === null) {
      return errorResponse(res, 'tenureMonths is required', 400);
    }

    const result = calculateEMI(
      parseFloat(principal),
      parseFloat(annualRate),
      parseInt(tenureMonths, 10),
    );

    return successResponse(res, result, 'EMI calculated successfully');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}

// ─── POST /emi-calculator/schedule ───────────────────────────────────────────
export async function getEMIScheduleHandler(req, res) {
  try {
    const { principal, annualRate, tenureMonths } = req.body;

    if (principal === undefined || principal === null) {
      return errorResponse(res, 'principal is required', 400);
    }
    if (annualRate === undefined || annualRate === null) {
      return errorResponse(res, 'annualRate is required', 400);
    }
    if (tenureMonths === undefined || tenureMonths === null) {
      return errorResponse(res, 'tenureMonths is required', 400);
    }

    const schedule = getEMISchedule(
      parseFloat(principal),
      parseFloat(annualRate),
      parseInt(tenureMonths, 10),
    );

    return successResponse(res, schedule, 'EMI schedule generated successfully');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}
