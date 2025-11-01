import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { createError } from '../middleware/errorHandler';
import { uploadImage, uploadImages } from '../utils/storage.util';

/**
 * Upload a single image
 * POST /api/upload/image
 */
export const uploadSingleImage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    if (!req.file) {
      throw createError('No file uploaded', 400);
    }

    const imageUrl = await uploadImage(req.file, req.user.id);

    res.json({
      status: 'success',
      data: {
        imageUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload multiple images
 * POST /api/upload/images
 */
export const uploadMultipleImages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw createError('No files uploaded', 400);
    }

    // Limit to 10 images max
    if (req.files.length > 10) {
      throw createError('Maximum 10 images allowed', 400);
    }

    const imageUrls = await uploadImages(req.files, req.user.id);

    res.json({
      status: 'success',
      data: {
        imageUrls
      }
    });
  } catch (error) {
    next(error);
  }
};

