import { useQuery } from 'react-query';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Paper,
  Stack,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Favorite } from '@mui/icons-material';
import { getFavorites } from '../services/favorite.service';
import ListingCard from '../components/ListingCard';

const FavoritesPage = () => {
  const { data, isLoading } = useQuery('favorites', getFavorites);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Typography 
        variant="h2" 
        component="h1" 
        sx={{ 
          mb: 1,
          fontSize: { xs: '2rem', md: '2.5rem' },
        }}
      >
        My Favorites
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Your saved listings
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
          <CircularProgress />
        </Box>
      ) : data?.data.favorites.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
          <Favorite sx={{ fontSize: 64, color: 'text.secondary', mb: 3, opacity: 0.3 }} />
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              No favorites yet
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You haven't favorited any listings yet.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start browsing to find items you like!
            </Typography>
          </Stack>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {data?.data.favorites.map((listing) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={listing.id}>
              <ListingCard listing={listing} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default FavoritesPage;
