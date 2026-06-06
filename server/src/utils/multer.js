import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDirs = [
  'uploads/profiles',
  'uploads/kyc',
  'uploads/properties/images',
  'uploads/properties/videos',
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

function imageFilter(req, file, cb) {
  ['image/jpeg', 'image/png'].includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error('Only JPEG and PNG images are allowed'), false);
}

function documentFilter(req, file, cb) {
  ['image/jpeg', 'image/png', 'application/pdf'].includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error('Only JPEG, PNG, and PDF files are allowed'), false);
}

function videoFilter(req, file, cb) {
  ['video/mp4', 'video/quicktime'].includes(file.mimetype)
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
