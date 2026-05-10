import { loginAdmin, verifyAdminOtp, logoutAssociate } from '../services/auth.service.js';
import { successResponse } from '../utils/response.js';
import { logAdminAction } from '../middleware/auditLog.js';

export async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await loginAdmin(email, password);
    return successResponse(res, result, 'OTP sent to registered email');
  } catch (err) {
    return next(err);
  }
}

export async function adminVerifyOtp(req, res, next) {
  try {
    const { adminId, otp } = req.body;
    const result = await verifyAdminOtp(adminId, otp);
    return successResponse(res, result, 'Login successful');
  } catch (err) {
    return next(err);
  }
}

export async function adminLogout(req, res, next) {
  try {
    const accessToken = req.headers.authorization.split(' ')[1];
    const { refreshToken } = req.body;
    await logoutAssociate(accessToken, refreshToken);
    await logAdminAction(req.admin.id, 'LOGOUT', 'Admin', req.admin.id, null, req.ip);
    return successResponse(res, null, 'Logged out successfully');
  } catch (err) {
    return next(err);
  }
}
