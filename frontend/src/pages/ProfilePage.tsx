import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Avatar,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Edit, CheckCircle, Add } from '@mui/icons-material';
import { useAuthStore } from '../stores/authStore';
import { getUserListings } from '../services/user.service';
import { Listing, markAsSold } from '../services/listing.service';
import ListingCard from '../components/ListingCard';

const ProfilePage = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: listingsData, isLoading } = useQuery(
    ['user-listings', user?.id],
    () => getUserListings(user!.id),
    { enabled: !!user }
  );

  const markAsSoldMutation = useMutation(
    (listingId: string) => markAsSold(listingId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['user-listings', user?.id]);
      }
    }
  );

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ borderRadius: 2 }}>Please log in to view your profile</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Box>
            <Typography 
              variant="h2" 
              component="h1" 
              sx={{ 
                mb: 1,
                fontSize: { xs: '2rem', md: '2.5rem' },
              }}
            >
              My Profile
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your account and listings
            </Typography>
          </Box>
          <Button
            component={Link}
            to="/create-listing"
            variant="contained"
            color="primary"
            startIcon={<Add />}
          >
            New Listing
          </Button>
        </Stack>

        {/* Profile Card */}
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
            <Avatar
              sx={{
                width: { xs: 80, md: 100 },
                height: { xs: 80, md: 100 },
                bgcolor: 'primary.main',
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 600,
              }}
            >
              {user.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flexGrow: 1, width: '100%' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="start" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 600 }}>
                    {user.username}
                  </Typography>
                  {user.firstName && user.lastName && (
                    <Typography variant="body2" color="text.secondary">
                      {user.firstName} {user.lastName}
                    </Typography>
                  )}
                </Box>
                <Button
                  component={Link}
                  to="/profile/edit"
                  variant="outlined"
                  startIcon={<Edit />}
                  size="small"
                >
                  Edit
                </Button>
              </Stack>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Email
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {user.email}
                  </Typography>
                </Grid>
                {user.phone && (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Phone
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {user.phone}
                    </Typography>
                  </Grid>
                )}
                {user.location && (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Location
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {user.location}
                    </Typography>
                  </Grid>
                )}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Listings
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {listingsData?.data.listings.length || 0}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </Paper>
      </Box>

      {/* My Listings */}
      <Box>
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 3,
            fontWeight: 600,
          }}
        >
          My Listings
        </Typography>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : listingsData?.data.listings.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
              You haven't created any listings yet.
            </Typography>
            <Button
              component={Link}
              to="/create-listing"
              variant="contained"
              color="primary"
              startIcon={<Add />}
              size="large"
            >
              Create Your First Listing
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {listingsData?.data.listings.map((listing: Listing) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={listing.id}>
                <Stack spacing={2} sx={{ height: '100%' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <ListingCard listing={listing} />
                  </Box>
                  {!listing.isSold && listing.isActive && (
                    <Button
                      variant="contained"
                      color="success"
                      size="medium"
                      startIcon={<CheckCircle />}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        markAsSoldMutation.mutate(listing.id);
                      }}
                      disabled={markAsSoldMutation.isLoading}
                      fullWidth
                    >
                      Mark as Sold
                    </Button>
                  )}
                </Stack>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default ProfilePage;
