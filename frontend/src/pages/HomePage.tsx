import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Paper,
  Grid,
  alpha,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { getHomepageData } from '../services/listing.service';
import { ListingGridSkeleton } from '../components/LoadingSkeleton';
import { RecentlyViewed } from '../components/RecentlyViewed';
import { ListingCarousel } from '../components/ListingCarousel';
import { Testimonials } from '../components/Testimonials';
import ListingCard from '../components/ListingCard';

const HomePage = () => {
  const { data: homepageData, isLoading: isLoadingHomepage } = useQuery(
    'homepage-data',
    () => getHomepageData()
  );

  const categories = [
    {
      name: 'Gaming PCs',
      description: 'High-performance systems built for gaming',
      icon: '🎮',
      link: '/listings?categorySlug=case',
      color: '#6366f1',
    },
    {
      name: 'GPUs',
      description: 'Latest graphics cards for your build',
      icon: '🖥️',
      link: '/listings?categorySlug=gpu',
      color: '#10b981',
    },
    {
      name: 'CPUs',
      description: 'Powerful processors for any task',
      icon: '⚡',
      link: '/listings?categorySlug=cpu',
      color: '#f59e0b',
    },
    {
      name: 'Peripherals',
      description: 'Keyboards, mice, monitors & more',
      icon: '⌨️',
      link: '/listings?categorySlug=peripheral',
      color: '#a855f7',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          pt: { xs: 12, md: 16 },
          pb: { xs: 8, md: 12 },
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Background gradient effect */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Stack spacing={4} alignItems="center" textAlign="center">
            <Box>
              <Typography
                variant="h1"
                sx={{
                  mb: 3,
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                }}
              >
                The PC Parts Marketplace
                <Box
                  component="span"
                  sx={{
                    display: 'block',
                    mt: 1,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Built for Gamers
                </Box>
              </Typography>
              <Typography 
                variant="h5" 
                color="text.secondary" 
                sx={{ 
                  maxWidth: '600px',
                  mx: 'auto',
                  fontWeight: 400,
                  lineHeight: 1.6,
                }}
              >
                Buy and sell PC components, gaming gear, and tech accessories in Macedonia. 
                Simple. Fast. Reliable.
              </Typography>
            </Box>

            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              sx={{ mt: 2 }}
            >
              <Button 
                component={Link} 
                to="/listings" 
                variant="contained" 
                color="primary" 
                size="large"
                endIcon={<ArrowForward />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  borderRadius: 2,
                }}
              >
                Browse Listings
              </Button>
              <Button 
                component={Link} 
                to="/create-listing" 
                variant="outlined" 
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  borderRadius: 2,
                }}
              >
                Start Selling
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Shop by Category Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography variant="h3" sx={{ mb: 4, fontWeight: 600 }}>
          Shop by Category
        </Typography>
        <Grid container spacing={3}>
          {categories.map((category) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={category.name}>
              <Paper
                component={Link}
                to={category.link}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  textDecoration: 'none',
                  height: '100%',
                  background: `linear-gradient(135deg, ${alpha(category.color, 0.1)} 0%, transparent 100%)`,
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                    borderColor: category.color,
                  },
                }}
              >
                <Stack spacing={2} alignItems="center" textAlign="center">
                  <Box
                    sx={{
                      fontSize: '3rem',
                      mb: 1,
                    }}
                  >
                    {category.icon}
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {category.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {category.description}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Most Watched / Trending Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <ListingCarousel
          title="Most Watched This Week"
          listings={homepageData?.data.trending || []}
          isLoading={isLoadingHomepage}
          viewAllLink="/listings?sort=newest"
        />
      </Container>

      {/* Featured Listings Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Stack spacing={4}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  mb: 1,
                  fontWeight: 600,
                }}
              >
                Featured Listings
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Handpicked items from top sellers
              </Typography>
            </Box>
            <Button
              component={Link}
              to="/listings"
              endIcon={<ArrowForward />}
              sx={{ 
                display: { xs: 'none', sm: 'flex' },
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' }
              }}
            >
              View All
            </Button>
          </Box>

          {isLoadingHomepage ? (
            <ListingGridSkeleton count={6} />
          ) : (
            <>
              <Grid container spacing={3}>
                {homepageData?.data.featured.slice(0, 6).map((listing) => (
                  <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={listing.id}>
                    <ListingCard listing={listing} />
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ textAlign: 'center', pt: 2 }}>
                <Button 
                  component={Link} 
                  to="/listings" 
                  variant="outlined" 
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{
                    display: { xs: 'flex', sm: 'none' },
                    mx: 'auto',
                  }}
                >
                  View All Listings
                </Button>
              </Box>
            </>
          )}
        </Stack>
      </Container>

      {/* Recently Sold Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <ListingCarousel
          title="Recently Sold"
          listings={homepageData?.data.recentlySold || []}
          isLoading={isLoadingHomepage}
          viewAllLink="/listings"
        />
      </Container>

      {/* Recently Viewed Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <RecentlyViewed />
      </Container>

      {/* Testimonials Section */}
      <Box
        sx={{
          borderTop: '1px solid',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth="lg">
          <Testimonials />
        </Container>
      </Box>

      {/* Stats Section */}
      <Box
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          py: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} textAlign="center">
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="h3" sx={{ mb: 1, color: 'primary.main' }}>
                {homepageData?.data.stats.totalActiveListings || '0'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Active Listings
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="h3" sx={{ mb: 1, color: 'primary.main' }}>
                24/7
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Support Available
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="h3" sx={{ mb: 1, color: 'primary.main' }}>
                Fast
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Easy Transactions
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
