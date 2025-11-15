import { Box, Chip, Stack } from '@mui/material';
import { Clear } from '@mui/icons-material';
import { useCategories } from '../hooks/useCategories';

interface QuickFiltersProps {
  selectedCategoryId?: string;
  selectedCategorySlug?: string;
  onSelect: (categoryId?: string, categorySlug?: string) => void;
}

export const QuickFilters = ({ selectedCategoryId, selectedCategorySlug, onSelect }: QuickFiltersProps) => {
  // Fetch categories using shared hook (cached, deduplicated)
  const { data: allCategories = [] } = useCategories();
  
  // Take first 7 categories for quick filters (excluding "All")
  const categories = allCategories.slice(0, 7);

  return (
    <Stack 
      direction="row" 
      spacing={1} 
      sx={{ 
        flexWrap: 'wrap', 
        gap: 1,
        mb: 3,
        overflowX: 'auto',
        pb: 1,
        '&::-webkit-scrollbar': {
          height: 4,
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 2,
        },
      }}
    >
      <Chip
        key="all"
        label="All"
        onClick={() => onSelect(undefined, undefined)}
        sx={{
          cursor: 'pointer',
          backgroundColor: !selectedCategoryId && !selectedCategorySlug ? '#6366f1' : 'transparent',
          color: !selectedCategoryId && !selectedCategorySlug ? '#ffffff' : 'text.secondary',
          border: '1px solid',
          borderColor: !selectedCategoryId && !selectedCategorySlug ? '#6366f1' : 'divider',
          fontWeight: !selectedCategoryId && !selectedCategorySlug ? 600 : 400,
          '&:hover': {
            backgroundColor: !selectedCategoryId && !selectedCategorySlug ? '#6366f1' : 'rgba(255, 255, 255, 0.05)',
            borderColor: '#6366f1',
          },
          transition: 'all 0.2s ease',
        }}
      />
      {categories.map((category) => {
        const isSelected = selectedCategoryId === category.id || selectedCategorySlug === category.slug;
        return (
          <Chip
            key={category.id}
            label={category.displayName || category.name}
            onClick={() => onSelect(category.id, category.slug)}
            sx={{
              cursor: 'pointer',
              backgroundColor: isSelected ? (category.color || '#6366f1') : 'transparent',
              color: isSelected ? '#ffffff' : 'text.secondary',
              border: '1px solid',
              borderColor: isSelected ? (category.color || '#6366f1') : 'divider',
              fontWeight: isSelected ? 600 : 400,
              '&:hover': {
                backgroundColor: isSelected ? (category.color || '#6366f1') : 'rgba(255, 255, 255, 0.05)',
                borderColor: category.color || '#6366f1',
              },
              transition: 'all 0.2s ease',
            }}
          />
        );
      })}
    </Stack>
  );
};
