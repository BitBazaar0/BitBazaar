import { useQuery } from 'react-query';
import { getCategoryBrands, Brand } from '../services/category.service';

/**
 * Custom hook to fetch popular brands for a category
 * 
 * Uses React Query caching to minimize API calls
 * 
 * @param categorySlug - Optional category slug to filter brands
 * @param limit - Maximum number of brands to return (default: 10)
 * @returns React Query result with brands data
 */
export const useCategoryBrands = (categorySlug?: string, limit: number = 10) => {
  return useQuery<Brand[], Error>(
    ['category-brands', categorySlug, limit],
    () => getCategoryBrands(categorySlug),
    {
      staleTime: 15 * 60 * 1000, // 15 minutes - brands don't change frequently
      cacheTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
      retry: 1,
      // Brands are nice-to-have for navigation, so keep previous data on error
      keepPreviousData: true,
      enabled: true, // Always enabled, categorySlug can be undefined for all brands
    }
  );
};

