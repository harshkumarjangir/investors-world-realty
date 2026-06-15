import * as avService from '../../services/admin/appVersion.service.js';
import { successResponse, createdResponse } from '../../utils/response.js';

export async function listAppVersionsHandler(req, res, next) {
  try { return successResponse(res, await avService.listAppVersions()); } catch (e) { return next(e); }
}

export async function upsertAppVersionHandler(req, res, next) {
  try {
    const { platform, ...data } = req.body;
    const result = await avService.upsertAppVersion(platform, data);
    return successResponse(res, result, 'App version updated');
  } catch (e) { return next(e); }
}

export async function listBrandingAssetsHandler(req, res, next) {
  try { return successResponse(res, await avService.listBrandingAssets()); } catch (e) { return next(e); }
}

export async function upsertBrandingAssetHandler(req, res, next) {
  try {
    const { key } = req.body;
    let url = req.body.url;
    
    if (req.file) {
      // Assuming server is running on localhost or has a domain set,
      // but for relative paths we just store the relative URL
      url = `/uploads/branding/${req.file.filename}`;
    }

    if (!url) {
      return res.status(400).json({ status: 'error', message: 'url or file is required' });
    }

    const result = await avService.upsertBrandingAsset(key, url);
    return successResponse(res, result, 'Branding asset updated');
  } catch (e) { return next(e); }
}
