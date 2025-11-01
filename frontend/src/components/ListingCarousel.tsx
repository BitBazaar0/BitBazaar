import { Box, Typography, IconButton, Stack, Link as MuiLink } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import ListingCard from './ListingCard';
import { Listing } from '../services/listing.service';
import { ListingGridSkeleton } from './LoadingSkeleton';

interface ListingCarouselProps {
  title?: string;
  listings?: Listing[];
  isLoading?: boolean;
  viewAllLink?: string;
  showNavigation?: boolean;
}

export const ListingCarousel = ({
  title,
  listings = [],
  isLoading = false,
  viewAllLink,
  showNavigation = true,
}: ListingCarouselProps) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardWidth = 320; // Approximate width of each card including gap

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    const container = scrollRef.current;
    const scrollAmount = cardWidth * 2; // Scroll 2 cards at a time
    
    const newPosition =
      direction === 'right'
        ? scrollPosition + scrollAmount
        : scrollPosition - scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: 'smooth',
    });

    setScrollPosition(newPosition);
  };

  if (isLoading) {
    return (
      <Box sx={{ mb: 8 }}>
        {title && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h3" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          </Box>
        )}
        <ListingGridSkeleton count={6} />
      </Box>
    );
  }

  if (listings.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 8, position: 'relative' }}>
      {title && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          {viewAllLink && (
            <MuiLink
              component={Link}
              to={viewAllLink}
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9375rem',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              See all →
            </MuiLink>
          )}
        </Box>
      )}

      <Box sx={{ position: 'relative' }}>
        <Box
          ref={scrollRef}
          sx={{
            display: 'flex',
            gap: 3,
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            pb: 2,
            mx: -2,
            px: 2,
          }}
        >
          {listings.map((listing) => (
            <Box
              key={listing.id}
              sx={{
                minWidth: { xs: '85%', sm: 300, md: 320 },
                maxWidth: { xs: '85%', sm: 300, md: 320 },
              }}
            >
              <ListingCard listing={listing} />
            </Box>
          ))}
        </Box>

        {showNavigation && listings.length > 3 && (
          <>
            <IconButton
              onClick={() => handleScroll('left')}
              disabled={scrollPosition <= 0}
              sx={{
                position: 'absolute',
                left: -20,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 2,
                '&:hover': {
                  bgcolor: 'background.default',
                },
                '&.Mui-disabled': {
                  opacity: 0.3,
                },
                display: { xs: 'none', md: 'flex' },
              }}
            >
              <ArrowBackIos fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => handleScroll('right')}
              disabled={
                scrollRef.current
                  ? scrollPosition >=
                    scrollRef.current.scrollWidth - scrollRef.current.clientWidth - 50
                  : false
              }
              sx={{
                position: 'absolute',
                right: -20,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 2,
                '&:hover': {
                  bgcolor: 'background.default',
                },
                '&.Mui-disabled': {
                  opacity: 0.3,
                },
                display: { xs: 'none', md: 'flex' },
              }}
            >
              <ArrowForwardIos fontSize="small" />
            </IconButton>
          </>
        )}
      </Box>
    </Box>
  );
};

