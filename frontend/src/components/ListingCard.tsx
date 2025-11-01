import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Stack,
  alpha,
} from '@mui/material';
import { Star, Visibility, CheckCircle, LocationOn } from '@mui/icons-material';
import { Listing } from '../services/listing.service';
import { getCategoryBadgeColor } from '../config/categories';

interface ListingCardProps {
  listing: Listing;
}

const ListingCard = ({ listing }: ListingCardProps) => {
  return (
    <Card
      component={Link}
      to={`/listings/${listing.id}`}
      sx={{
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      {/* Category Badge - Top Left */}
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 2,
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
          bgcolor: getCategoryBadgeColor(listing.partType),
          border: '1px solid',
          borderColor: alpha(getCategoryBadgeColor(listing.partType), 0.3),
        }}
      >
        <Typography 
          variant="caption" 
          sx={{ 
            fontWeight: 700,
            color: '#ffffff',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {listing.partType}
        </Typography>
      </Box>

      {/* Status Badges - Top Right */}
      {listing.isSold && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            bgcolor: alpha('#10b981', 0.15),
            border: '1px solid',
            borderColor: alpha('#10b981', 0.3),
          }}
        >
          <CheckCircle sx={{ fontSize: 16, color: '#10b981' }} />
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 600, 
              color: '#10b981',
              fontSize: '0.75rem',
            }}
          >
            Sold
          </Typography>
        </Box>
      )}
      
      {listing.isBoosted && !listing.isSold && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            bgcolor: alpha('#6366f1', 0.15),
            border: '1px solid',
            borderColor: alpha('#6366f1', 0.3),
          }}
        >
          <Star sx={{ fontSize: 16, color: '#6366f1' }} />
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 600, 
              color: '#6366f1',
              fontSize: '0.75rem',
            }}
          >
            Featured
          </Typography>
        </Box>
      )}

      {/* Image */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          paddingTop: '75%', // 4:3 aspect ratio
          overflow: 'hidden',
          bgcolor: 'background.default',
        }}
      >
        {listing.images && listing.images.length > 0 ? (
          <CardMedia
            component="img"
            image={listing.images[0]}
            alt={listing.title}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          />
        ) : (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
              bgcolor: 'background.default',
            }}
          >
            <Typography variant="body2">No Image</Typography>
          </Box>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
        {/* Title */}
        <Typography 
          variant="h6" 
          component="h3" 
          sx={{ 
            mb: 1.5,
            fontWeight: 600,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: 56,
          }}
        >
          {listing.title}
        </Typography>

        {/* Tags */}
        <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
          <Chip 
            label={listing.partType} 
            size="small" 
            color="primary" 
            variant="outlined"
            sx={{ 
              fontSize: '0.75rem',
              height: 24,
              borderColor: alpha('#6366f1', 0.3),
              color: '#818cf8',
            }}
          />
          <Chip
            label={listing.condition.charAt(0).toUpperCase() + listing.condition.slice(1)}
            size="small"
            variant="outlined"
            sx={{ 
              fontSize: '0.75rem',
              height: 24,
              borderColor: 'rgba(255, 255, 255, 0.1)',
              color: 'text.secondary',
            }}
          />
        </Stack>

        {/* Brand */}
        {listing.brand && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              fontSize: '0.8125rem',
            }}
          >
            {listing.brand}
          </Typography>
        )}

        {/* Price and Meta Info */}
        <Box sx={{ mt: 'auto', pt: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                fontSize: '1.25rem',
                color: 'primary.main',
              }}
            >
              {listing.price.toFixed(0)} MKD
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocationOn sx={{ fontSize: 14, opacity: 0.7 }} />
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  fontSize: '0.75rem',
                }}
              >
                {listing.location}
              </Typography>
            </Box>
          </Box>
          
          <Stack 
            direction="row" 
            spacing={2} 
            sx={{ 
              fontSize: '0.75rem', 
              color: 'text.secondary',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Visibility sx={{ fontSize: 16, opacity: 0.7 }} />
              <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                {listing.views}
              </Typography>
            </Box>
            <Typography 
              variant="caption" 
              sx={{ 
                fontSize: '0.75rem',
              }}
            >
              {format(new Date(listing.createdAt), 'MMM d')}
            </Typography>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ListingCard;
