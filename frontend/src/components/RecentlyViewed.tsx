import { Box, Typography, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { ListingCarousel } from './ListingCarousel';
import { useQuery } from 'react-query';
import { getListings } from '../services/listing.service';
import { ListingGridSkeleton } from './LoadingSkeleton';

export const RecentlyViewed = () => {
  const { items, clearAll } = useRecentlyViewed();

  // Fetch full listing data for recently viewed items
  const listingIds = items.map(item => item.id);
  const { data, isLoading } = useQuery(
    ['recently-viewed-listings', listingIds],
    async () => {
      if (listingIds.length === 0) return { data: { listings: [] } };
      
      // Fetch listings by IDs - we'll need to add a new endpoint or fetch individually
      // For now, use a reasonable limit and filter client-side
      const response = await getListings({ 
        limit: 50, 
        page: 1 
      });
      
      // Filter to only show listings that are in recently viewed
      const viewedIds = new Set(listingIds);
      const filtered = response.data.listings
        .filter(listing => viewedIds.has(listing.id))
        .sort((a, b) => {
          // Sort by the order they were viewed (most recent first)
          const aIndex = listingIds.indexOf(a.id);
          const bIndex = listingIds.indexOf(b.id);
          return aIndex - bIndex;
        })
        .slice(0, 8); // Limit to 8 items
      
      return {
        ...response,
        data: {
          ...response.data,
          listings: filtered
        }
      };
    },
    {
      enabled: listingIds.length > 0
    }
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography 
            variant="h3" 
            sx={{ 
              mb: 1,
              fontWeight: 600,
            }}
          >
            Recently Viewed
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Continue browsing where you left off
          </Typography>
        </Box>
        <IconButton 
          onClick={clearAll} 
          size="small" 
          sx={{ 
            color: 'text.secondary',
            '&:hover': {
              color: 'error.main',
              bgcolor: 'action.hover',
            }
          }}
        >
          <Close />
        </IconButton>
      </Box>
      
      {isLoading ? (
        <ListingGridSkeleton count={4} />
      ) : (
        <ListingCarousel
          listings={data?.data.listings || []}
          isLoading={isLoading}
          viewAllLink="/listings"
        />
      )}
    </Box>
  );
};

