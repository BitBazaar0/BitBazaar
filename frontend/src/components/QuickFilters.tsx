import { Box, Chip, Stack } from '@mui/material';
import { Clear } from '@mui/icons-material';
import { PartType } from '../services/listing.service';

interface QuickFiltersProps {
  selectedType?: PartType;
  onSelect: (type?: PartType) => void;
}

const quickFilters: { label: string; type?: PartType; color: string }[] = [
  { label: 'All', type: undefined, color: '#6366f1' },
  { label: 'GPUs', type: 'GPU', color: '#6366f1' },
  { label: 'CPUs', type: 'CPU', color: '#10b981' },
  { label: 'RAM', type: 'RAM', color: '#f59e0b' },
  { label: 'Storage', type: 'Storage', color: '#ec4899' },
  { label: 'Cases', type: 'Case', color: '#14b8a6' },
  { label: 'Peripherals', type: 'Peripheral', color: '#a855f7' },
  { label: 'Monitors', type: 'Monitor', color: '#f97316' },
];

export const QuickFilters = ({ selectedType, onSelect }: QuickFiltersProps) => {
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
      {quickFilters.map((filter) => (
        <Chip
          key={filter.label}
          label={filter.label}
          onClick={() => onSelect(filter.type)}
          sx={{
            cursor: 'pointer',
            backgroundColor: selectedType === filter.type ? filter.color : 'transparent',
            color: selectedType === filter.type ? '#ffffff' : 'text.secondary',
            border: '1px solid',
            borderColor: selectedType === filter.type ? filter.color : 'divider',
            fontWeight: selectedType === filter.type ? 600 : 400,
            '&:hover': {
              backgroundColor: selectedType === filter.type ? filter.color : 'rgba(255, 255, 255, 0.05)',
              borderColor: filter.color,
            },
            transition: 'all 0.2s ease',
          }}
        />
      ))}
    </Stack>
  );
};

