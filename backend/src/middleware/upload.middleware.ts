import multer from 'multer';
import { Request } from 'express';

// Configure multer for memory storage (we'll upload directly to Supabase)
const storage = multer.memoryStorage();

// File filter - only allow images
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed.'));
  }
};

// Multer configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 10 // Max 10 files at once
  }
});

// Middleware for single image upload
export const uploadSingle = upload.single('image');

// Middleware for multiple image uploads
export const uploadMultiple = upload.array('images', 10);

