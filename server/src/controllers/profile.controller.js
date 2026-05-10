import {
  getProfile,
  updateProfile,
  updateProfilePhoto,
  submitKYC,
} from '../services/profile.service.js';
import { successResponse } from '../utils/response.js';

export async function getProfileHandler(req, res, next) {
  try {
    const data = await getProfile(req.associate.id);
    return successResponse(res, data, 'Profile retrieved');
  } catch (err) {
    return next(err);
  }
}

export async function updateProfileHandler(req, res, next) {
  try {
    const data = await updateProfile(req.associate.id, req.body);
    return successResponse(res, data, 'Profile updated');
  } catch (err) {
    return next(err);
  }
}

export async function uploadPhotoHandler(req, res, next) {
  try {
    if (!req.file) {
      return next(Object.assign(new Error('No file uploaded'), { statusCode: 400 }));
    }
    const filePath = req.file.path;
    const data = await updateProfilePhoto(req.associate.id, filePath);
    return successResponse(res, data, 'Profile photo updated');
  } catch (err) {
    return next(err);
  }
}

export async function submitPANHandler(req, res, next) {
  try {
    if (!req.file) {
      return next(Object.assign(new Error('No document uploaded'), { statusCode: 400 }));
    }
    const { documentNumber } = req.body;
    if (!documentNumber) {
      return next(Object.assign(new Error('Document number is required'), { statusCode: 400 }));
    }
    const data = await submitKYC(req.associate.id, 'PAN', documentNumber, req.file.path);
    return successResponse(res, data, 'PAN document submitted');
  } catch (err) {
    return next(err);
  }
}

export async function submitAadhaarHandler(req, res, next) {
  try {
    if (!req.file) {
      return next(Object.assign(new Error('No document uploaded'), { statusCode: 400 }));
    }
    const { documentNumber } = req.body;
    if (!documentNumber) {
      return next(Object.assign(new Error('Document number is required'), { statusCode: 400 }));
    }
    const data = await submitKYC(req.associate.id, 'AADHAAR', documentNumber, req.file.path);
    return successResponse(res, data, 'Aadhaar document submitted');
  } catch (err) {
    return next(err);
  }
}

export async function submitBankHandler(req, res, next) {
  try {
    const { accountNumber, ifsc, bankName, branch } = req.body;
    if (!accountNumber || !ifsc || !bankName) {
      return next(
        Object.assign(new Error('accountNumber, ifsc, and bankName are required'), { statusCode: 400 }),
      );
    }
    const bankDetails = JSON.stringify({ accountNumber, ifsc, bankName, branch: branch || '' });
    const data = await submitKYC(req.associate.id, 'BANK', bankDetails, '');
    return successResponse(res, data, 'Bank details submitted');
  } catch (err) {
    return next(err);
  }
}
