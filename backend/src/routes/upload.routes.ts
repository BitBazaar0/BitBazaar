import express from 'express';
import * as uploadController from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadSingle, uploadMultiple } from '../middleware/upload.middleware';

const router = express.Router();

// Upload single image
router.post(
  '/image',
  authenticate,
  uploadSingle,
  uploadController.uploadSingleImage
);

// Upload multiple images
router.post(
  '/images',
  authenticate,
  uploadMultiple,
  uploadController.uploadMultipleImages
);

export default router;

