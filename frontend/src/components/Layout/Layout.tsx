import { ReactNode } from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: { xs: 8, md: 14 },
          backgroundColor: 'background.default',
        }}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;
