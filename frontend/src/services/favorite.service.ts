import api from '../utils/api';
import { Listing } from './listing.service';

export interface FavoritesResponse {
  status: string;
  data: {
    favorites: Listing[];
  };
}

export const getFavorites = async (): Promise<FavoritesResponse> => {
  const response = await api.get<FavoritesResponse>('/favorites');
  return response.data;
};

export const addFavorite = async (listingId: string) => {
  const response = await api.post(`/favorites/${listingId}`);
  return response.data;
};

export const removeFavorite = async (listingId: string) => {
  const response = await api.delete(`/favorites/${listingId}`);
  return response.data;
};

export const checkFavorite = async (listingId: string) => {
  const response = await api.get(`/favorites/check/${listingId}`);
  return response.data;
};

