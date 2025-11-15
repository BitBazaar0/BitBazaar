import api from '../utils/api';
import { Category } from './category.service';

export type Condition = 'new' | 'used' | 'refurbished';

export interface Listing {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  category?: Category;
  brand?: string;
  model?: string;
  condition: Condition;
  price: number;
  location: string;
  images: string[];
  sellerId: string;
  views: number;
  isActive: boolean;
  isBoosted: boolean;
  isSold: boolean;
  createdAt: string;
  updatedAt: string;
  seller?: {
    id: string;
    username: string;
    avatar?: string;
    location?: string;
  };
  _count?: {
    favorites: number;
  };
}

export type SortOption = 'newest' | 'oldest' | 'price-low' | 'price-high' | 'recently-added';

export interface ListingFilters {
  categoryId?: string;
  categorySlug?: string;
  brand?: string;
  condition?: Condition;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  search?: string;
  sellerId?: string;
  isActive?: boolean;
  sort?: SortOption;
  page?: number;
  limit?: number;
}

export interface ListingCreateInput {
  title: string;
  description: string;
  categoryId: string;
  brand?: string;
  model?: string;
  condition: Condition;
  price: number;
  location: string;
  images: string[];
}

export interface ListingsResponse {
  status: string;
  data: {
    listings: Listing[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface HomepageData {
  featured: Listing[];
  trending: Listing[];
  recentlySold: Listing[];
  stats: {
    totalActiveListings: number;
  };
}

export interface HomepageResponse {
  status: string;
  data: HomepageData;
}

export const getHomepageData = async (): Promise<HomepageResponse> => {
  const response = await api.get<HomepageResponse>('/listings/homepage');
  return response.data;
};

export const getListings = async (filters?: ListingFilters): Promise<ListingsResponse> => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
  }

  const response = await api.get<ListingsResponse>(`/listings?${params.toString()}`);
  return response.data;
};

export const getListingById = async (id: string) => {
  const response = await api.get(`/listings/${id}`);
  return response.data;
};

export const createListing = async (data: ListingCreateInput) => {
  const response = await api.post('/listings', data);
  return response.data;
};

export const updateListing = async (id: string, data: Partial<ListingCreateInput>) => {
  const response = await api.patch(`/listings/${id}`, data);
  return response.data;
};

export const deleteListing = async (id: string) => {
  const response = await api.delete(`/listings/${id}`);
  return response.data;
};

export const incrementView = async (id: string) => {
  const response = await api.post(`/listings/${id}/view`);
  return response.data;
};

export const markAsSold = async (id: string) => {
  const response = await api.post(`/listings/${id}/sold`);
  return response.data;
};

