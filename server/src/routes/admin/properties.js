import { Router } from 'express';
import { authenticateAdmin, requirePermission } from '../../middleware/auth.js';
import { uploadPropertyImages, uploadPropertyVideo } from '../../utils/multer.js';
import {
  listPropertiesAdminHandler,
  createPropertyHandler,
  uploadPropertyImagesHandler,
  uploadPropertyVideoHandler,
  editPropertyHandler,
  updatePropertyStatusHandler,
  deletePropertyHandler,
  getPropertyInquiriesHandler,
} from '../../controllers/admin/property.controller.js';

const router = Router();

// All routes require admin authentication
router.use(authenticateAdmin);

// GET /api/v1/admin/properties
router.get('/', requirePermission('properties:read'), listPropertiesAdminHandler);

// POST /api/v1/admin/properties
router.post('/', requirePermission('properties:write'), createPropertyHandler);

// POST /api/v1/admin/properties/:id/images
router.post(
  '/:id/images',
  requirePermission('properties:write'),
  uploadPropertyImages.array('images', 10),
  uploadPropertyImagesHandler,
);

// POST /api/v1/admin/properties/:id/video
router.post(
  '/:id/video',
  requirePermission('properties:write'),
  uploadPropertyVideo.single('video'),
  uploadPropertyVideoHandler,
);

// PATCH /api/v1/admin/properties/:id
router.patch('/:id', requirePermission('properties:write'), editPropertyHandler);

// PATCH /api/v1/admin/properties/:id/status
router.patch('/:id/status', requirePermission('properties:write'), updatePropertyStatusHandler);

// DELETE /api/v1/admin/properties/:id
router.delete('/:id', requirePermission('properties:delete'), deletePropertyHandler);

// GET /api/v1/admin/properties/:id/inquiries
router.get('/:id/inquiries', requirePermission('properties:read'), getPropertyInquiriesHandler);

export default router;
