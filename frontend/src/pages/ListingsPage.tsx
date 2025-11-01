import { useState, useEffect, useRef } from 'react';
import { useQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Pagination,
  Alert,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { getListings, ListingFilters, SortOption, PartType } from '../services/listing.service';
import ListingCard from '../components/ListingCard';
import ListingFiltersComponent from '../components/ListingFilters';
import { ListingGridSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { QuickFilters } from '../components/QuickFilters';

const ListingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize filters from URL parameters
  const getInitialFilters = (): ListingFilters => {
    const params: ListingFilters = {
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '20', 10),
      sort: (searchParams.get('sort') as SortOption) || 'newest',
    };

    const partType = searchParams.get('partType');
    if (partType) {
      params.partType = partType as PartType;
    }

    const brand = searchParams.get('brand');
    if (brand) {
      params.brand = brand;
    }

    const condition = searchParams.get('condition');
    if (condition) {
      params.condition = condition as 'new' | 'used' | 'refurbished';
    }

    const minPrice = searchParams.get('minPrice');
    if (minPrice && !isNaN(parseInt(minPrice, 10))) {
      params.minPrice = parseInt(minPrice, 10);
    }

    const maxPrice = searchParams.get('maxPrice');
    if (maxPrice && !isNaN(parseInt(maxPrice, 10))) {
      params.maxPrice = parseInt(maxPrice, 10);
    }

    const location = searchParams.get('location');
    if (location) {
      params.location = location;
    }

    const search = searchParams.get('search');
    if (search) {
      params.search = search;
    }

    return params;
  };

  const [filters, setFilters] = useState<ListingFilters>(getInitialFilters());
  const isUpdatingFromUrl = useRef(false);
  const lastFiltersRef = useRef<string>('');
  const lastUrlRef = useRef<string>(searchParams.toString());
  const isInitialMount = useRef(true);
  const filtersRef = useRef<ListingFilters>(filters);

  // Keep filtersRef in sync with filters state
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Initialize refs on mount
  useEffect(() => {
    if (isInitialMount.current) {
      lastFiltersRef.current = normalizeFilters(filters);
      lastUrlRef.current = searchParams.toString();
      filtersRef.current = filters;
      isInitialMount.current = false;
    }
  }, []);

  // Helper to normalize filter objects for comparison
  const normalizeFilters = (f: ListingFilters): string => {
    const normalized: any = {};
    if (f.page) normalized.page = f.page;
    if (f.limit) normalized.limit = f.limit;
    if (f.sort) normalized.sort = f.sort;
    if (f.partType) normalized.partType = f.partType;
    if (f.brand) normalized.brand = f.brand;
    if (f.condition) normalized.condition = f.condition;
    if (f.minPrice !== undefined) normalized.minPrice = f.minPrice;
    if (f.maxPrice !== undefined) normalized.maxPrice = f.maxPrice;
    if (f.location) normalized.location = f.location;
    if (f.search) normalized.search = f.search;
    return JSON.stringify(normalized);
  };

  // Helper to build URL params from filters
  const buildUrlParams = (f: ListingFilters): URLSearchParams => {
    const params = new URLSearchParams();
    // Sort keys for consistent URL string representation
    const sortedEntries = Object.entries(f).sort(([a], [b]) => a.localeCompare(b));
    sortedEntries.forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });
    return params;
  };

  // Sync filters with URL parameters when filters change from user interaction
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      return;
    }

    // Skip if we're updating from URL to avoid loop
    if (isUpdatingFromUrl.current) {
      return;
    }

    // Normalize and compare filters
    const filtersString = normalizeFilters(filters);
    
    // If filters haven't actually changed, don't update URL
    if (filtersString === lastFiltersRef.current) {
      return;
    }
    
    lastFiltersRef.current = filtersString;
    
    const newParams = buildUrlParams(filters);
    const newParamsString = newParams.toString();
    
    // Only update URL if it's actually different
    if (newParamsString !== lastUrlRef.current) {
      lastUrlRef.current = newParamsString;
      setSearchParams(newParams, { replace: true });
    }
  }, [filters, setSearchParams]);

  // Update filters when URL parameters change externally (browser navigation, direct links)
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      return;
    }

    const currentUrlString = searchParams.toString();
    
    // Skip if URL hasn't changed
    if (currentUrlString === lastUrlRef.current) {
      return;
    }
    
    lastUrlRef.current = currentUrlString;

    const urlFilters = getInitialFilters();
    const urlFiltersString = normalizeFilters(urlFilters);
    
    // Only update filters if they're actually different from current filters
    const currentFiltersString = normalizeFilters(filtersRef.current);
    
    if (urlFiltersString !== currentFiltersString) {
      // Mark that we're updating from URL
      isUpdatingFromUrl.current = true;
      lastFiltersRef.current = urlFiltersString;
      filtersRef.current = urlFilters;
      setFilters(urlFilters);
      
      // Reset flag after state update completes
      setTimeout(() => {
        isUpdatingFromUrl.current = false;
      }, 10);
    }
  }, [searchParams]);

  const { data, isLoading } = useQuery(
    ['listings', filters],
    () => getListings(filters),
    { keepPreviousData: true }
  );

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setFilters({ ...filters, page: value });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (sort: SortOption) => {
    setFilters({ ...filters, sort, page: 1 });
  };

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'recently-added', label: 'Recently Added' },
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Typography 
          variant="h2" 
          component="h1" 
          sx={{ 
            mb: 1,
            fontSize: { xs: '2rem', md: '2.5rem' },
          }}
        >
          Browse Listings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover the best PC parts and gaming gear
        </Typography>
      </Box>

      {/* Content Grid */}
      <Grid container spacing={4}>
        {/* Filters Sidebar */}
        <Grid 
          size={{ xs: 12, md: 3 }}
          sx={{ 
            display: { xs: 'none', md: 'block' }
          }}
        >
          <Box sx={{ position: 'sticky', top: 120 }}>
            <ListingFiltersComponent filters={filters} onFiltersChange={setFilters} />
          </Box>
        </Grid>

        {/* Listings Grid */}
        <Grid size={{ xs: 12, md: 9 }}>
          {isLoading ? (
            <ListingGridSkeleton count={6} />
          ) : (
            <>
              {data && data.data.listings.length === 0 ? (
                <EmptyState
                  title="No listings found"
                  description="Try adjusting your filters or check back later for new listings."
                  actionLabel="Clear Filters"
                  actionPath="/listings"
                />
              ) : (
                <>
                  {/* Quick Filters */}
                  <QuickFilters 
                    selectedType={filters.partType} 
                    onSelect={(type) => {
                      // Clear search when selecting a partType filter to avoid confusion
                      setFilters({ ...filters, partType: type, search: undefined, page: 1 });
                    }} 
                  />

                  {/* Results Header */}
                  {data && (
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: 3,
                        flexWrap: 'wrap',
                        gap: 2,
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                        <Typography variant="body1" color="text.secondary">
                          <strong>{data.data.pagination.totalItems}</strong>{' '}
                          {data.data.pagination.totalItems === 1 ? 'listing' : 'listings'} found
                        </Typography>
                      </Stack>
                      
                      <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel id="sort-select-label">Sort by</InputLabel>
                        <Select
                          labelId="sort-select-label"
                          id="sort-select"
                          value={filters.sort || 'newest'}
                          label="Sort by"
                          onChange={(e) => handleSortChange(e.target.value as SortOption)}
                          sx={{
                            backgroundColor: 'background.paper',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'divider',
                            },
                          }}
                        >
                          {sortOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  )}

                  {/* Listings Grid */}
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    {data?.data.listings.map((listing) => (
                      <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={listing.id}>
                        <ListingCard listing={listing} />
                      </Grid>
                    ))}
                  </Grid>

                  {/* Pagination */}
                  {data && data.data.pagination.totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                      <Pagination
                        count={data.data.pagination.totalPages}
                        page={filters.page || 1}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                        sx={{
                          '& .MuiPaginationItem-root': {
                            color: 'text.secondary',
                            '&.Mui-selected': {
                              backgroundColor: 'primary.main',
                              color: 'white',
                              '&:hover': {
                                backgroundColor: 'primary.dark',
                              },
                            },
                          },
                        }}
                      />
                    </Box>
                  )}
                </>
              )}
            </>
          )}
        </Grid>

        {/* Mobile Filters */}
        <Grid 
          size={{ xs: 12 }}
          sx={{ 
            display: { xs: 'block', md: 'none' },
            mt: 2,
          }}
        >
          <ListingFiltersComponent filters={filters} onFiltersChange={setFilters} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default ListingsPage;
