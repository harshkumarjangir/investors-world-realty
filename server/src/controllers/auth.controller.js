import {
  loginAssociate,
  verifyAssociateOtp,
  refreshAssociateToken,
  logoutAssociate,
  sendOtp,
  resetPassword,
  changePassword,
} from '../services/auth.service.js';
import { successResponse } from '../utils/response.js';
import prisma from '../utils/prisma.js';

export async function login(req, res, next) {
  try {
    const { userId, password, deviceToken, platform } = req.body;
    const result = await loginAssociate(userId, password, deviceToken, platform);
    return successResponse(res, result, 'OTP sent to registered email');
  } catch (err) {
    return next(err);
  }
}

export async function verifyOtpHandler(req, res, next) {
  try {
    const { associateId, otp } = req.body;
    const result = await verifyAssociateOtp(associateId, otp);
    return successResponse(res, result, 'Login successful');
  } catch (err) {
    return next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const result = await refreshAssociateToken(refreshToken);
    return successResponse(res, result, 'Token refreshed');
  } catch (err) {
    return next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const accessToken = req.headers.authorization.split(' ')[1];
    const { refreshToken, deviceToken } = req.body;
    await logoutAssociate(accessToken, refreshToken, deviceToken);
    return successResponse(res, null, 'Logged out successfully');
  } catch (err) {
    return next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { identifier } = req.body;

    const associate = await prisma.associate.findFirst({
      where: {
        OR: [{ phone: identifier }, { email: identifier }],
        deletedAt: null,
      },
    });

    // Always return success to prevent user enumeration
    if (associate) {
      await sendOtp(identifier);
    }

    return successResponse(res, null, 'If the account exists, an OTP has been sent');
  } catch (err) {
    return next(err);
  }
}

export async function resetPasswordHandler(req, res, next) {
  try {
    const { identifier, otp, newPassword } = req.body;
    await resetPassword(identifier, otp, newPassword);
    return successResponse(res, null, 'Password reset successfully');
  } catch (err) {
    return next(err);
  }
}

export async function changePasswordHandler(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    await changePassword(req.associate.id, currentPassword, newPassword);
    return successResponse(res, null, 'Password changed successfully');
  } catch (err) {
    return next(err);
  }
}
