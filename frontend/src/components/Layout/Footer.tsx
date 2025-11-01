import { Link } from 'react-router-dom';
import { Box, Container, Typography, Link as MuiLink, Stack, Divider } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'background.default',
        borderTop: '1px solid',
        borderColor: 'divider',
        mt: 8,
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={6}
          justifyContent="space-between"
        >
          <Box sx={{ maxWidth: { xs: '100%', md: '300px' } }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              BitBazaar
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              Your trusted marketplace for PC parts and gaming gear in Macedonia.
            </Typography>
          </Box>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={6}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Quick Links
              </Typography>
              <Stack spacing={1.5}>
                <MuiLink 
                  component={Link} 
                  to="/listings" 
                  color="text.secondary" 
                  underline="none"
                  sx={{ 
                    '&:hover': { color: 'primary.main' },
                    transition: 'color 0.2s ease'
                  }}
                >
                  Browse Listings
                </MuiLink>
                <MuiLink 
                  component={Link} 
                  to="/create-listing" 
                  color="text.secondary" 
                  underline="none"
                  sx={{ 
                    '&:hover': { color: 'primary.main' },
                    transition: 'color 0.2s ease'
                  }}
                >
                  Sell Your Parts
                </MuiLink>
                <MuiLink 
                  component={Link} 
                  to="/favorites" 
                  color="text.secondary" 
                  underline="none"
                  sx={{ 
                    '&:hover': { color: 'primary.main' },
                    transition: 'color 0.2s ease'
                  }}
                >
                  My Favorites
                </MuiLink>
              </Stack>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Support
              </Typography>
              <Stack spacing={1.5}>
                <MuiLink 
                  href="/about" 
                  color="text.secondary" 
                  underline="none"
                  sx={{ 
                    '&:hover': { color: 'primary.main' },
                    transition: 'color 0.2s ease'
                  }}
                >
                  About Us
                </MuiLink>
                <MuiLink 
                  href="/contact" 
                  color="text.secondary" 
                  underline="none"
                  sx={{ 
                    '&:hover': { color: 'primary.main' },
                    transition: 'color 0.2s ease'
                  }}
                >
                  Contact
                </MuiLink>
                <MuiLink 
                  href="/help" 
                  color="text.secondary" 
                  underline="none"
                  sx={{ 
                    '&:hover': { color: 'primary.main' },
                    transition: 'color 0.2s ease'
                  }}
                >
                  Help Center
                </MuiLink>
              </Stack>
            </Box>
          </Stack>
        </Stack>
        
        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            &copy; 2024 BitBazaar. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
