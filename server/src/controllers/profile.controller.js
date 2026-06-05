import {
  getProfile,
  updateProfile,
  submitKYCAll,
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
    const updateData = { ...req.body };
    if (req.file) {
      updateData.profilePhoto = req.file.path.replace(/\\/g, '/');
    }
    const data = await updateProfile(req.associate.id, updateData);
    return successResponse(res, data, 'Profile updated');
  } catch (err) {
    return next(err);
  }
}

export async function submitKYCHandler(req, res, next) {
  try {
    const {
      panNumber,
      aadhaarNumber,
      bankAccountNumber,
      bankIfsc,
      bankName,
      bankBranch,
    } = req.body;

    const panDocumentUrl = req.files?.panDocument?.[0]?.path?.replace(/\\/g, '/') || null;
    const panDocumentBackUrl = req.files?.panDocumentBack?.[0]?.path?.replace(/\\/g, '/') || null;
    const aadhaarDocumentUrl = req.files?.aadhaarDocument?.[0]?.path?.replace(/\\/g, '/') || null;
    const aadhaarDocumentBackUrl = req.files?.aadhaarDocumentBack?.[0]?.path?.replace(/\\/g, '/') || null;
    const chequeDocumentUrl = req.files?.chequeDocument?.[0]?.path?.replace(/\\/g, '/') || null;

    // Cross validations
    if ((panDocumentUrl || panDocumentBackUrl) && !panNumber) {
      return next(Object.assign(new Error('panNumber is required when uploading PAN document'), { statusCode: 400 }));
    }
    if ((aadhaarDocumentUrl || aadhaarDocumentBackUrl) && !aadhaarNumber) {
      return next(Object.assign(new Error('aadhaarNumber is required when uploading Aadhaar document'), { statusCode: 400 }));
    }
    if (bankAccountNumber || bankIfsc || bankName || bankBranch || chequeDocumentUrl) {
      if (!bankAccountNumber || !bankIfsc || !bankName) {
        return next(
          Object.assign(
            new Error('bankAccountNumber, bankIfsc, and bankName are required for bank details'),
            { statusCode: 400 },
          ),
        );
      }
    }

    if (
      !panNumber &&
      !panDocumentUrl &&
      !panDocumentBackUrl &&
      !aadhaarNumber &&
      !aadhaarDocumentUrl &&
      !aadhaarDocumentBackUrl &&
      !bankAccountNumber &&
      !bankIfsc &&
      !bankName &&
      !chequeDocumentUrl
    ) {
      return next(Object.assign(new Error('No KYC details provided to submit'), { statusCode: 400 }));
    }

    const data = await submitKYCAll(req.associate.id, {
      panNumber,
      panDocumentUrl,
      panDocumentBackUrl,
      aadhaarNumber,
      aadhaarDocumentUrl,
      aadhaarDocumentBackUrl,
      bankAccountNumber,
      bankIfsc,
      bankName,
      bankBranch,
      chequeDocumentUrl,
    });

    return successResponse(res, data, 'KYC submitted successfully');
  } catch (err) {
    return next(err);
  }
}
