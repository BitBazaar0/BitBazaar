import { Box, Skeleton, Card, CardContent } from '@mui/material';
import Grid from '@mui/material/Grid';

export const ListingCardSkeleton = () => {
  return (
    <Card sx={{ height: '100%' }}>
      <Skeleton variant="rectangular" width="100%" height={240} />
      <CardContent>
        <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Skeleton variant="rectangular" width={60} height={24} />
          <Skeleton variant="rectangular" width={60} height={24} />
        </Box>
        <Skeleton variant="text" width="60%" height={20} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton variant="text" width={100} height={32} />
          <Skeleton variant="text" width={80} height={20} />
        </Box>
      </CardContent>
    </Card>
  );
};

export const ListingGridSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={index}>
          <ListingCardSkeleton />
        </Grid>
      ))}
    </Grid>
  );
};

