import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = req.params.folder || 'misc';
    const uploadPath = path.join(process.cwd(), 'uploads', folder);
    
    // Create folder if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// POST /api/upload/:folder
router.post('/:folder', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  const folder = req.params.folder || 'misc';
  // Return the public URL for the image
  const imageUrl = `http://localhost:5001/uploads/${folder}/${req.file.filename}`;
  
  res.json({ 
    message: 'File uploaded successfully',
    url: imageUrl 
  });
});

export default router;
