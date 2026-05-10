import { getSettings, updateSettings } from '../services/settings.service.js';
import { successResponse } from '../utils/response.js';

export async function getSettingsHandler(req, res, next) {
  try {
    const data = await getSettings(req.associate.id);
    return successResponse(res, data, 'Settings retrieved');
  } catch (err) {
    return next(err);
  }
}

export async function updateSettingsHandler(req, res, next) {
  try {
    const data = await updateSettings(req.associate.id, req.body);
    return successResponse(res, data, 'Settings updated');
  } catch (err) {
    return next(err);
  }
}
