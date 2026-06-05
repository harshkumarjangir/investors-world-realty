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
      updateData.profilePhoto = req.file.path;
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

    const panDocumentUrl = req.files?.panDocument?.[0]?.path || null;
    const aadhaarDocumentUrl = req.files?.aadhaarDocument?.[0]?.path || null;

    // Cross validations
    if (panDocumentUrl && !panNumber) {
      return next(Object.assign(new Error('panNumber is required when uploading PAN document'), { statusCode: 400 }));
    }
    if (aadhaarDocumentUrl && !aadhaarNumber) {
      return next(Object.assign(new Error('aadhaarNumber is required when uploading Aadhaar document'), { statusCode: 400 }));
    }
    if (bankAccountNumber || bankIfsc || bankName || bankBranch) {
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
      !aadhaarNumber &&
      !aadhaarDocumentUrl &&
      !bankAccountNumber &&
      !bankIfsc &&
      !bankName
    ) {
      return next(Object.assign(new Error('No KYC details provided to submit'), { statusCode: 400 }));
    }

    const data = await submitKYCAll(req.associate.id, {
      panNumber,
      panDocumentUrl,
      aadhaarNumber,
      aadhaarDocumentUrl,
      bankAccountNumber,
      bankIfsc,
      bankName,
      bankBranch,
    });

    return successResponse(res, data, 'KYC submitted successfully');
  } catch (err) {
    return next(err);
  }
}
