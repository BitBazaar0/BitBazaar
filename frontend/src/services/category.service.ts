import api from '../utils/api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  displayName: string;
  icon?: string;
  color?: string;
  isActive: boolean;
}

export interface CategoriesResponse {
  status: string;
  data: {
    categories: Category[];
  };
}

export interface CategoryResponse {
  status: string;
  data: {
    category: Category & {
      _count?: {
        listings: number;
      };
    };
  };
}

/**
 * Get all active categories
 */
export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get<CategoriesResponse>('/categories');
  return response.data.data.categories;
};

/**
 * Get a category by slug
 */
export const getCategoryBySlug = async (slug: string): Promise<CategoryResponse['data']['category']> => {
  const response = await api.get<CategoryResponse>(`/categories/${slug}`);
  return response.data.data.category;
};

export interface Brand {
  name: string;
  count: number;
}

export interface CategoryBrandsResponse {
  status: string;
  data: {
    brands: Brand[];
    categorySlug: string | null;
  };
}

/**
 * Get popular brands for a category
 */
export const getCategoryBrands = async (categorySlug?: string): Promise<Brand[]> => {
  const url = categorySlug 
    ? `/categories/${categorySlug}/brands` 
    : '/categories/brands';
  const response = await api.get<CategoryBrandsResponse>(url);
  return response.data.data.brands;
};

