import api from '../utils/api';

export interface UploadImageResponse {
  status: string;
  data: {
    imageUrl: string;
  };
}

export interface UploadImagesResponse {
  status: string;
  data: {
    imageUrls: string[];
  };
}

/**
 * Upload a single image
 */
export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post<UploadImageResponse>('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data.imageUrl;
};

/**
 * Upload multiple images
 */
export const uploadImages = async (files: File[]): Promise<string[]> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });

  const response = await api.post<UploadImagesResponse>('/upload/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data.imageUrls;
};

