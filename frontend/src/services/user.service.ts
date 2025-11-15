import api from '../utils/api';

export const getUserProfile = async (id: string) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const getUserListings = async (id: string) => {
  const response = await api.get(`/users/${id}/listings`);
  return response.data;
};

export const updateProfile = async (data: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  avatar?: string;
}) => {
  const response = await api.patch('/users/profile', data);
  return response.data;
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  const response = await api.post('/users/change-password', data);
  return response.data;
};
