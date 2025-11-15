import { useQuery } from 'react-query';
import { getCategories, Category } from '../services/category.service';

/**
 * Custom hook to fetch categories with optimized caching
 * 
 * Categories rarely change, so we use long cache times:
 * - staleTime: 30 minutes (data is considered fresh)
 * - cacheTime: 1 hour (keeps data in cache even when unused)
 * 
 * This hook is shared across all components, ensuring:
 * - Single API call (deduplication)
 * - Shared cache across components
 * - Consistent cache configuration
 * 
 * @returns {Object} React Query result with categories data
 */
export const useCategories = () => {
  return useQuery<Category[], Error>(
    'categories',
    getCategories,
    {
      staleTime: 30 * 60 * 1000, // 30 minutes - data is fresh
      cacheTime: 60 * 60 * 1000, // 1 hour - keep in cache
      refetchOnWindowFocus: false, // Don't refetch on window focus
      retry: 1, // Retry once on failure
      // Categories are critical for navigation, so keep previous data on error
      keepPreviousData: true,
    }
  );
};

