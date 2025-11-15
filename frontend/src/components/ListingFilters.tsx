import { useState, useEffect, useRef } from 'react';
import {
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Box,
  Stack,
  Divider,
  Collapse,
  IconButton,
  Chip,
  InputAdornment,
  alpha,
} from '@mui/material';
import { 
  ExpandMore, 
  ExpandLess, 
  Search as SearchIcon,
  FilterList,
} from '@mui/icons-material';
import { ListingFilters, Condition } from '../services/listing.service';
import { useCategories } from '../hooks/useCategories';

interface ListingFiltersComponentProps {
  filters: ListingFilters;
  onFiltersChange: (filters: ListingFilters) => void;
}

const ListingFiltersComponent = ({ filters, onFiltersChange }: ListingFiltersComponentProps) => {
  const [localFilters, setLocalFilters] = useState<ListingFilters>(filters);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    condition: false,
    location: false,
  });
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch categories using shared hook (cached, deduplicated)
  const { data: categories = [] } = useCategories();

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (key: keyof ListingFilters, value: any, immediate = false) => {
    const newFilters = { ...localFilters, [key]: value || undefined, page: 1 };
    
    // If user selects a category filter, clear the search to avoid confusion
    if ((key === 'categoryId' || key === 'categorySlug') && value) {
      newFilters.search = undefined;
    }
    
    setLocalFilters(newFilters);
    
    // For search, debounce the update to avoid too many API calls
    if (key === 'search' && !immediate) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        onFiltersChange(newFilters);
      }, 600); // 600ms debounce for search
    } else {
      // Clear any pending search debounce if user changes another filter
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
      onFiltersChange(newFilters);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleReset = () => {
    const resetFilters = { page: 1, limit: 20 };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const hasActiveFilters = !!(
    localFilters.search ||
    localFilters.categoryId ||
    localFilters.categorySlug ||
    localFilters.brand ||
    localFilters.condition ||
    localFilters.minPrice ||
    localFilters.maxPrice ||
    localFilters.location
  );

  const conditions: Condition[] = ['new', 'used', 'refurbished'];

  return (
    <Paper 
      sx={{ 
        p: 3, 
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList sx={{ fontSize: 20, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Filters
          </Typography>
        </Box>
        {hasActiveFilters && (
          <Button 
            size="small" 
            onClick={handleReset}
            sx={{ 
              color: 'text.secondary',
              textTransform: 'none',
              fontSize: '0.875rem',
              '&:hover': { 
                color: 'primary.main',
                bgcolor: alpha('#6366f1', 0.1),
              }
            }}
          >
            Clear All
          </Button>
        )}
      </Box>

      <Stack spacing={3}>
        {/* Search */}
        <TextField
          placeholder="Search listings..."
          value={localFilters.search || ''}
          onChange={(e) => {
            setLocalFilters({ ...localFilters, search: e.target.value });
            handleChange('search', e.target.value, false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              // Clear any pending timeout and update immediately
              if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
              }
              handleChange('search', localFilters.search, true);
            }
          }}
          fullWidth
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: 'background.default',
              '&:hover': {
                bgcolor: 'background.default',
              },
              '&.Mui-focused': {
                bgcolor: 'background.default',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Active Filters */}
        {hasActiveFilters && (
          <Box>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                mb: 1.5, 
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.75rem',
              }}
            >
              Active Filters
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {localFilters.search && (
                <Chip
                  label={`Search: "${localFilters.search}"`}
                  onDelete={() => handleChange('search', undefined)}
                  size="small"
                  sx={{
                    bgcolor: alpha('#6366f1', 0.15),
                    color: 'primary.main',
                    border: '1px solid',
                    borderColor: alpha('#6366f1', 0.3),
                    fontWeight: 500,
                    '& .MuiChip-deleteIcon': {
                      color: 'primary.main',
                      '&:hover': {
                        color: 'primary.dark',
                      },
                    },
                  }}
                />
              )}
              {(localFilters.categoryId || localFilters.categorySlug) && (
                <Chip
                  label={
                    localFilters.categoryId 
                      ? categories.find(c => c.id === localFilters.categoryId)?.name || 'Category'
                      : categories.find(c => c.slug === localFilters.categorySlug)?.name || 'Category'
                  }
                  onDelete={() => {
                    handleChange('categoryId', undefined);
                    handleChange('categorySlug', undefined);
                  }}
                  size="small"
                  sx={{
                    bgcolor: alpha('#6366f1', 0.15),
                    color: 'primary.main',
                    border: '1px solid',
                    borderColor: alpha('#6366f1', 0.3),
                    fontWeight: 500,
                    '& .MuiChip-deleteIcon': {
                      color: 'primary.main',
                      '&:hover': {
                        color: 'primary.dark',
                      },
                    },
                  }}
                />
              )}
              {localFilters.condition && (
                <Chip
                  label={localFilters.condition.charAt(0).toUpperCase() + localFilters.condition.slice(1)}
                  onDelete={() => handleChange('condition', undefined)}
                  size="small"
                  sx={{
                    bgcolor: alpha('#6366f1', 0.15),
                    color: 'primary.main',
                    border: '1px solid',
                    borderColor: alpha('#6366f1', 0.3),
                    fontWeight: 500,
                    '& .MuiChip-deleteIcon': {
                      color: 'primary.main',
                      '&:hover': {
                        color: 'primary.dark',
                      },
                    },
                  }}
                />
              )}
              {(localFilters.minPrice || localFilters.maxPrice) && (
                <Chip
                  label={`${localFilters.minPrice || 0} - ${localFilters.maxPrice || '∞'} MKD`}
                  onDelete={() => {
                    handleChange('minPrice', undefined);
                    handleChange('maxPrice', undefined);
                  }}
                  size="small"
                  sx={{
                    bgcolor: alpha('#6366f1', 0.15),
                    color: 'primary.main',
                    border: '1px solid',
                    borderColor: alpha('#6366f1', 0.3),
                    fontWeight: 500,
                    '& .MuiChip-deleteIcon': {
                      color: 'primary.main',
                      '&:hover': {
                        color: 'primary.dark',
                      },
                    },
                  }}
                />
              )}
              {localFilters.brand && (
                <Chip
                  label={`Brand: ${localFilters.brand}`}
                  onDelete={() => handleChange('brand', undefined)}
                  size="small"
                  sx={{
                    bgcolor: alpha('#6366f1', 0.15),
                    color: 'primary.main',
                    border: '1px solid',
                    borderColor: alpha('#6366f1', 0.3),
                    fontWeight: 500,
                    '& .MuiChip-deleteIcon': {
                      color: 'primary.main',
                      '&:hover': {
                        color: 'primary.dark',
                      },
                    },
                  }}
                />
              )}
              {localFilters.location && (
                <Chip
                  label={`Location: ${localFilters.location}`}
                  onDelete={() => handleChange('location', undefined)}
                  size="small"
                  sx={{
                    bgcolor: alpha('#6366f1', 0.15),
                    color: 'primary.main',
                    border: '1px solid',
                    borderColor: alpha('#6366f1', 0.3),
                    fontWeight: 500,
                    '& .MuiChip-deleteIcon': {
                      color: 'primary.main',
                      '&:hover': {
                        color: 'primary.dark',
                      },
                    },
                  }}
                />
              )}
            </Stack>
          </Box>
        )}

        {hasActiveFilters && <Divider sx={{ my: 1 }} />}

        {/* Product Category */}
        <Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
              cursor: 'pointer',
              py: 0.5,
              '&:hover': {
                '& .section-title': {
                  color: 'primary.main',
                },
              },
            }}
            onClick={() => toggleSection('category')}
          >
            <Typography 
              className="section-title"
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600, 
                textTransform: 'uppercase', 
                fontSize: '0.8125rem', 
                letterSpacing: '0.8px',
                color: 'text.primary',
                transition: 'color 0.2s ease',
              }}
            >
              Product Category
            </Typography>
            <IconButton 
              size="small" 
              sx={{ 
                p: 0.5,
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                  bgcolor: alpha('#6366f1', 0.1),
                },
              }}
            >
              {expandedSections.category ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          <Collapse in={expandedSections.category}>
            <TextField
              select
              fullWidth
              value={localFilters.categoryId || ''}
              onChange={(e) => handleChange('categoryId', e.target.value || undefined)}
              size="small"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'background.default',
                },
              }}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.displayName || category.name}
                </MenuItem>
              ))}
            </TextField>
          </Collapse>
        </Box>

        {/* Price */}
        <Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
              cursor: 'pointer',
              py: 0.5,
              '&:hover': {
                '& .section-title': {
                  color: 'primary.main',
                },
              },
            }}
            onClick={() => toggleSection('price')}
          >
            <Typography 
              className="section-title"
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600, 
                textTransform: 'uppercase', 
                fontSize: '0.8125rem', 
                letterSpacing: '0.8px',
                color: 'text.primary',
                transition: 'color 0.2s ease',
              }}
            >
              Price Range
            </Typography>
            <IconButton 
              size="small" 
              sx={{ 
                p: 0.5,
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                  bgcolor: alpha('#6366f1', 0.1),
                },
              }}
            >
              {expandedSections.price ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          <Collapse in={expandedSections.price}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <TextField
                type="number"
                placeholder="Min"
                value={localFilters.minPrice || ''}
                onChange={(e) =>
                  handleChange('minPrice', e.target.value ? Number(e.target.value) : undefined)
                }
                fullWidth
                size="small"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'background.default',
                  },
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 24, textAlign: 'center', fontWeight: 500 }}>
                —
              </Typography>
              <TextField
                type="number"
                placeholder="Max"
                value={localFilters.maxPrice || ''}
                onChange={(e) =>
                  handleChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)
                }
                fullWidth
                size="small"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'background.default',
                  },
                }}
              />
            </Stack>
          </Collapse>
        </Box>

        {/* Condition */}
        <Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
              cursor: 'pointer',
              py: 0.5,
              '&:hover': {
                '& .section-title': {
                  color: 'primary.main',
                },
              },
            }}
            onClick={() => toggleSection('condition')}
          >
            <Typography 
              className="section-title"
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600, 
                textTransform: 'uppercase', 
                fontSize: '0.8125rem', 
                letterSpacing: '0.8px',
                color: 'text.primary',
                transition: 'color 0.2s ease',
              }}
            >
              Condition
            </Typography>
            <IconButton 
              size="small" 
              sx={{ 
                p: 0.5,
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                  bgcolor: alpha('#6366f1', 0.1),
                },
              }}
            >
              {expandedSections.condition ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          <Collapse in={expandedSections.condition}>
            <TextField
              select
              fullWidth
              value={localFilters.condition || ''}
              onChange={(e) => handleChange('condition', (e.target.value || undefined) as Condition)}
              size="small"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'background.default',
                },
              }}
            >
              <MenuItem value="">All Conditions</MenuItem>
              {conditions.map((condition) => (
                <MenuItem key={condition} value={condition}>
                  {condition.charAt(0).toUpperCase() + condition.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Collapse>
        </Box>

        {/* Brand */}
        <Box>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              mb: 1.5,
              fontWeight: 600, 
              textTransform: 'uppercase', 
              fontSize: '0.8125rem', 
              letterSpacing: '0.8px',
              color: 'text.primary',
            }}
          >
            Brand
          </Typography>
          <TextField
            placeholder="e.g., NVIDIA, AMD, ASUS"
            value={localFilters.brand || ''}
            onChange={(e) => handleChange('brand', e.target.value || undefined)}
            fullWidth
            size="small"
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: 'background.default',
              },
            }}
          />
        </Box>

        {/* Location */}
        <Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
              cursor: 'pointer',
              py: 0.5,
              '&:hover': {
                '& .section-title': {
                  color: 'primary.main',
                },
              },
            }}
            onClick={() => toggleSection('location')}
          >
            <Typography 
              className="section-title"
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600, 
                textTransform: 'uppercase', 
                fontSize: '0.8125rem', 
                letterSpacing: '0.8px',
                color: 'text.primary',
                transition: 'color 0.2s ease',
              }}
            >
              Location
            </Typography>
            <IconButton 
              size="small" 
              sx={{ 
                p: 0.5,
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                  bgcolor: alpha('#6366f1', 0.1),
                },
              }}
            >
              {expandedSections.location ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          <Collapse in={expandedSections.location}>
            <TextField
              fullWidth
              placeholder="City or region"
              value={localFilters.location || ''}
              onChange={(e) => handleChange('location', e.target.value || undefined)}
              size="small"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'background.default',
                },
              }}
            />
          </Collapse>
        </Box>
      </Stack>
    </Paper>
  );
};

export default ListingFiltersComponent;
