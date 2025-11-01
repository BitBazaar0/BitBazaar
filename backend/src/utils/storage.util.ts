import { supabase, STORAGE_BUCKET } from '../lib/supabase';
import { createError } from '../middleware/errorHandler';

/**
 * Upload an image file to Supabase Storage
 * @param file - The file buffer or file object
 * @param fileName - The unique filename for the image
 * @param userId - The user ID who is uploading (for organization)
 * @returns The public URL of the uploaded image
 */
export const uploadImage = async (
  file: Express.Multer.File,
  userId: string
): Promise<string> => {
  try {
    // Generate unique filename: userId/timestamp-random-filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${userId}/${timestamp}-${random}.${fileExtension}`;

    // Upload to Supabase Storage
    let data, error;
    try {
      const result = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });
      data = result.data;
      error = result.error;
    } catch (err: any) {
      throw createError(`Failed to upload image: ${err.message || 'Supabase not configured'}`, 500);
    }

    if (error || !data) {
      throw createError(`Failed to upload image: ${error?.message || 'Upload failed'}`, 500);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error: any) {
    if (error.status) {
      throw error;
    }
    throw createError(`Image upload failed: ${error.message}`, 500);
  }
};

/**
 * Upload multiple images
 * @param files - Array of file objects
 * @param userId - The user ID who is uploading
 * @returns Array of public URLs
 */
export const uploadImages = async (
  files: Express.Multer.File[],
  userId: string
): Promise<string[]> => {
  try {
    const uploadPromises = files.map((file) => uploadImage(file, userId));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error: any) {
    throw createError(`Failed to upload images: ${error.message}`, 500);
  }
};

/**
 * Delete an image from Supabase Storage
 * @param imageUrl - The public URL of the image
 * @returns true if successful
 */
export const deleteImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const pathIndex = pathParts.indexOf(STORAGE_BUCKET);
    
    if (pathIndex === -1) {
      throw createError('Invalid image URL', 400);
    }

    const filePath = pathParts.slice(pathIndex + 1).join('/');

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      throw createError(`Failed to delete image: ${error.message}`, 500);
    }

    return true;
  } catch (error: any) {
    if (error.status) {
      throw error;
    }
    throw createError(`Image deletion failed: ${error.message}`, 500);
  }
};

/**
 * Delete multiple images
 * @param imageUrls - Array of image URLs
 * @returns true if all successful
 */
export const deleteImages = async (imageUrls: string[]): Promise<boolean> => {
  try {
    const deletePromises = imageUrls.map((url) => deleteImage(url));
    await Promise.all(deletePromises);
    return true;
  } catch (error: any) {
    throw createError(`Failed to delete images: ${error.message}`, 500);
  }
};

