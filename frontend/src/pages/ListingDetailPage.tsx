import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Button,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  CardMedia,
  Avatar,
  Tabs,
  Tab,
  Rating,
  alpha,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Favorite,
  Message,
  Visibility,
  LocationOn,
  Edit,
  Star,
  Person,
  Phone,
  Email,
  CalendarToday,
  ArrowBack,
  Share,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { getListingById, incrementView, getListings } from '../services/listing.service';
import ListingCard from '../components/ListingCard';
import { getUserProfile } from '../services/user.service';
import { addFavorite, removeFavorite, checkFavorite } from '../services/favorite.service';
import { createOrGetChat } from '../services/chat.service';
import { useAuthStore } from '../stores/authStore';
import { shareListing, getShareUrl } from '../utils/share';
import { useToast, Toast } from '../components/Toast';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 4 }}>{children}</Box>}
    </div>
  );
}

const ListingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast, showToast, hideToast } = useToast();
  const { addItem } = useRecentlyViewed();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const viewIncrementedRef = useRef(false);

  const { data, isLoading } = useQuery(
    ['listing', id],
    () => getListingById(id!),
    { enabled: !!id }
  );

  const { data: favoriteData } = useQuery(
    ['favorite', id],
    () => checkFavorite(id!),
    { enabled: !!id && !!user }
  );

  const { data: sellerData } = useQuery(
    ['seller', data?.data.listing?.sellerId],
    () => getUserProfile(data!.data.listing.sellerId),
    { enabled: !!data?.data.listing?.sellerId }
  );

  const viewMutation = useMutation(() => incrementView(id!));
  const favoriteMutation = useMutation(
    () => (favoriteData?.data.isFavorited ? removeFavorite(id!) : addFavorite(id!)),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['favorite', id]);
        showToast(
          favoriteData?.data.isFavorited 
            ? 'Removed from favorites' 
            : 'Added to favorites',
          'success'
        );
      }
    }
  );

  const handleShare = async () => {
    if (!listing) return;
    try {
      const url = getShareUrl(listing.id);
      const wasShared = await shareListing(listing.title, url);
      showToast(
        wasShared ? 'Shared successfully!' : 'Link copied to clipboard!',
        'success'
      );
    } catch (error: any) {
      showToast(error.message || 'Failed to share', 'error');
    }
  };

  const chatMutation = useMutation(() => createOrGetChat(id!, undefined), {
    onSuccess: (data) => {
      queryClient.invalidateQueries('user-chats');
      navigate(`/chat?chatId=${data.data.chat.id}`);
    }
  });

  useEffect(() => {
    // Reset ref when listing ID changes
    viewIncrementedRef.current = false;
  }, [id]);

  useEffect(() => {
    if (data?.data.listing && !viewIncrementedRef.current) {
      viewIncrementedRef.current = true;

      // Use setTimeout to ensure this only runs once even in React Strict Mode
      const timer = setTimeout(() => {
        viewMutation.mutate();
      }, 0);

      // Add to recently viewed
      addItem({
        id: data.data.listing.id,
        title: data.data.listing.title,
        price: data.data.listing.price,
        image: data.data.listing.images?.[0],
      });

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.data.listing]);

  if (!id) return null;

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!data?.data.listing) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>Listing not found</Alert>
      </Container>
    );
  }

  const listing = data.data.listing;
  const seller = sellerData?.data.user;
  const isFavorited = favoriteData?.data.isFavorited || false;
  const isOwner = user?.id === listing.sellerId;
  const images = listing.images && listing.images.length > 0 ? listing.images : [];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ 
          mb: 4,
          color: 'text.secondary',
          '&:hover': { color: 'text.primary' }
        }}
      >
        Back
      </Button>

      <Grid container spacing={4}>
        {/* Image Gallery */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            {/* Main Image */}
            <Paper 
              sx={{ 
                overflow: 'hidden', 
                bgcolor: 'background.default',
                borderRadius: 3,
                aspectRatio: '1 / 1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {images.length > 0 ? (
                <CardMedia
                  component="img"
                  image={images[selectedImageIndex]}
                  alt={`${listing.title} - Image ${selectedImageIndex + 1}`}
                  sx={{
                    objectFit: 'contain',
                    width: '100%',
                    height: '100%',
                  }}
                />
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No Image
                </Typography>
              )}
            </Paper>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <Stack direction="row" spacing={1.5} sx={{ overflowX: 'auto', pb: 1 }}>
                {images.map((image: string, index: number) => (
                  <Paper
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    sx={{
                      minWidth: 90,
                      height: 90,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      borderRadius: 2,
                      border: selectedImageIndex === index ? 2 : 1,
                      borderColor: selectedImageIndex === index ? 'primary.main' : 'divider',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="90"
                      image={image}
                      alt={`Thumbnail ${index + 1}`}
                      sx={{ objectFit: 'cover' }}
                    />
                  </Paper>
                ))}
              </Stack>
            )}
          </Stack>
        </Grid>

        {/* Product Info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={3}>
            {/* Status Badges */}
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {listing.category && (
                <Chip 
                  label={listing.category.name} 
                  color="primary" 
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: listing.category.color || undefined,
                    color: listing.category.color || undefined,
                  }}
                />
              )}
              <Chip
                label={listing.condition.charAt(0).toUpperCase() + listing.condition.slice(1)}
                variant="outlined"
                size="small"
              />
              {listing.isBoosted && (
                <Chip
                  icon={<Star sx={{ fontSize: 16 }} />}
                  label="Featured"
                  size="small"
                  sx={{
                    bgcolor: alpha('#6366f1', 0.15),
                    color: '#818cf8',
                    borderColor: alpha('#6366f1', 0.3),
                  }}
                />
              )}
            </Stack>

            {/* Title */}
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                lineHeight: 1.2,
                fontSize: { xs: '1.75rem', md: '2.25rem' },
              }}
            >
              {listing.title}
            </Typography>

            {/* Price */}
            <Box>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 800,
                  fontSize: { xs: '2rem', md: '2.75rem' },
                  color: 'primary.main',
                  mb: 0.5,
                }}
              >
                {listing.price.toFixed(0)} MKD
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Price is negotiable
              </Typography>
            </Box>

            {/* Quick Info Card */}
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Stack spacing={2}>
                {listing.brand && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Brand
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {listing.brand}
                    </Typography>
                  </Box>
                )}
                {listing.model && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Model
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {listing.model}
                    </Typography>
                  </Box>
                )}
                <Divider />
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <LocationOn sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body2">{listing.location}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Visibility sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body2">{listing.views} views</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CalendarToday sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Listed {format(new Date(listing.createdAt), 'MMMM d, yyyy')}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Paper>

            {/* Action Buttons */}
            {user && !isOwner && !listing.isSold && (
              <Stack direction="row" spacing={2}>
                <Button
                  variant={isFavorited ? 'outlined' : 'contained'}
                  startIcon={<Favorite />}
                  onClick={() => favoriteMutation.mutate()}
                  fullWidth
                  size="large"
                  sx={{
                    ...(isFavorited && {
                      borderColor: 'error.main',
                      color: 'error.main',
                      '&:hover': {
                        borderColor: 'error.dark',
                        bgcolor: alpha('#ef4444', 0.1),
                      },
                    }),
                  }}
                >
                  {isFavorited ? 'Favorited' : 'Favorite'}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Message />}
                  onClick={() => chatMutation.mutate()}
                  fullWidth
                  size="large"
                >
                  Contact Seller
                </Button>
              </Stack>
            )}

            {/* Share Button - Available to all */}
            <Button
              variant="outlined"
              startIcon={<Share />}
              onClick={handleShare}
              fullWidth
              size="large"
            >
              Share Listing
            </Button>

            {isOwner && (
              <Button
                component={Link}
                to={`/listings/${listing.id}/edit`}
                variant="outlined"
                startIcon={<Edit />}
                fullWidth
                size="large"
              >
                Edit Listing
              </Button>
            )}

            {listing.isSold && (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                This item has been sold.
              </Alert>
            )}
          </Stack>
        </Grid>
      </Grid>

      {/* Product Details Tabs */}
      <Box sx={{ mt: 6 }}>
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              px: 3,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.9375rem',
              },
            }}
          >
            <Tab label="Description" />
            <Tab label="Seller Information" />
            <Tab label="Specifications" />
          </Tabs>

          <Box sx={{ px: { xs: 3, md: 4 }, py: 3 }}>
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                About This Item
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}
              >
                {listing.description}
              </Typography>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {seller ? (
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          mx: 'auto',
                          mb: 2,
                          bgcolor: 'primary.main',
                          fontSize: '2rem',
                          fontWeight: 600,
                        }}
                      >
                        {seller.username.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="h6" gutterBottom fontWeight={600}>
                        {seller.username}
                      </Typography>
                      {seller.firstName && seller.lastName && (
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {seller.firstName} {seller.lastName}
                        </Typography>
                      )}
                      <Divider sx={{ my: 2 }} />
                      <Stack spacing={1.5} sx={{ textAlign: 'left' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Email sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2">{seller.email}</Typography>
                        </Box>
                        {seller.phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Phone sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2">{seller.phone}</Typography>
                          </Box>
                        )}
                        {seller.location && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2">{seller.location}</Typography>
                          </Box>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Person sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            Member since {format(new Date(seller.createdAt || new Date()), 'MMM yyyy')}
                          </Typography>
                        </Box>
                        {sellerData?.data.stats && (
                          <>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Seller Stats
                            </Typography>
                            <Stack spacing={0.5}>
                              <Typography variant="body2">
                                <strong>{sellerData.data.stats.totalListings}</strong> Listings
                              </Typography>
                              <Typography variant="body2">
                                <strong>{sellerData.data.stats.totalReviews}</strong> Reviews
                              </Typography>
                              {sellerData.data.stats.averageRating > 0 && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 0.5 }}>
                                  <Rating
                                    value={sellerData.data.stats.averageRating}
                                    readOnly
                                    precision={0.1}
                                    size="small"
                                  />
                                  <Typography variant="body2" color="text.secondary">
                                    ({sellerData.data.stats.averageRating.toFixed(1)})
                                  </Typography>
                                </Box>
                              )}
                            </Stack>
                          </>
                        )}
                      </Stack>
                      {user && !isOwner && !listing.isSold && (
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<Message />}
                          sx={{ mt: 3 }}
                          onClick={() => chatMutation.mutate()}
                        >
                          Contact Seller
                        </Button>
                      )}
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
                      About the Seller
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      {seller.firstName && seller.lastName
                        ? `${seller.firstName} ${seller.lastName} is a trusted seller on BitBazaar.`
                        : `${seller.username} is a trusted seller on BitBazaar.`}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {sellerData?.data.stats?.totalListings
                        ? `They have ${sellerData.data.stats.totalListings} active listing${
                            sellerData.data.stats.totalListings !== 1 ? 's' : ''
                          } on our platform.`
                        : 'Check out their other listings!'}
                    </Typography>
                  </Grid>
                </Grid>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Product Specifications
              </Typography>
              <Grid container spacing={3}>
                {listing.category && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Category
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {listing.category.name}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {listing.brand && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Brand
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {listing.brand}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {listing.model && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Model
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {listing.model}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                <Grid size={{xs: 12, sm: 6}}>
                  <Box sx={{ py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Condition
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {listing.condition.charAt(0).toUpperCase() + listing.condition.slice(1)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Price
                    </Typography>
                    <Typography variant="body1" fontWeight={600} color="primary.main">
                      {listing.price.toFixed(0)} MKD
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Location
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {listing.location}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ py: 1.5 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Views
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {listing.views}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ py: 1.5 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Listed Date
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {format(new Date(listing.createdAt), 'MMMM d, yyyy')}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </TabPanel>
          </Box>
        </Paper>
      </Box>

      {/* Related Listings */}
      {data && listing && (
        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
            More {listing.category?.name || 'Similar'} Listings
          </Typography>
          <RelatedListings currentListingId={listing.id} categoryId={listing.categoryId} />
        </Box>
        )}
        
        {/* Toast Notification */}
        <Toast
          open={toast.open}
          message={toast.message}
          severity={toast.severity}
          onClose={hideToast}
        />
      </Container>
    );
  };

// Related Listings Component
const RelatedListings = ({ currentListingId, categoryId }: { currentListingId: string; categoryId: string }) => {
  const { data, isLoading } = useQuery(
    ['related-listings', categoryId, currentListingId],
    () => getListings({ categoryId, limit: 6, page: 1 }),
    { enabled: !!categoryId }
  );

  const relatedListings = data?.data.listings.filter(l => l.id !== currentListingId).slice(0, 6) || [];

  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
            <Box sx={{ height: 400, bgcolor: 'background.paper', borderRadius: 3 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (relatedListings.length === 0) {
    return null;
  }

  return (
    <Grid container spacing={3}>
      {relatedListings.map((listing) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={listing.id}>
          <ListingCard listing={listing} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ListingDetailPage;
