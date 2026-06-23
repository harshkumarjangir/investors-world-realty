import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDirs = [
  'uploads/profiles',
  'uploads/kyc',
  'uploads/properties/images',
  'uploads/properties/videos',
  'uploads/branding',
];

uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function diskStorage(destination) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, destination),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname).toLowerCase()}`);
    },
  });
}

const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/heic-sequence',
  'image/heif-sequence',
];

const ALLOWED_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];

function isImage(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  return ALLOWED_IMAGE_MIMES.includes(file.mimetype) || ALLOWED_IMAGE_EXTS.includes(ext);
}

function imageFilter(req, file, cb) {
  isImage(file)
    ? cb(null, true)
    : cb(new Error('Only JPEG, JPG, PNG, WebP and HEIC/HEIF images are allowed'), false);
}

function documentFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  (isImage(file) || file.mimetype === 'application/pdf' || ext === '.pdf')
    ? cb(null, true)
    : cb(new Error('Only JPEG, JPG, PNG, WebP, HEIC/HEIF and PDF files are allowed'), false);
}

function videoFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  (['video/mp4', 'video/quicktime', 'application/octet-stream'].includes(file.mimetype) && ['.mp4', '.mov'].includes(ext) || ['video/mp4', 'video/quicktime'].includes(file.mimetype) || ['.mp4', '.mov'].includes(ext))
    ? cb(null, true)
    : cb(new Error('Only MP4 and MOV video formats are allowed'), false);
}

export const uploadProfilePhoto = multer({
  storage: diskStorage('uploads/profiles'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
  // limits: { fileSize: 2 * 1024 * 1024 },
});

export const uploadKYCDocument = multer({
  storage: diskStorage('uploads/kyc'),
  fileFilter: documentFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadPropertyImages = multer({
  storage: diskStorage('uploads/properties/images'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadPropertyVideo = multer({
  storage: diskStorage('uploads/properties/videos'),
  fileFilter: videoFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});

export const uploadBrandingAsset = multer({
  storage: diskStorage('uploads/branding'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
