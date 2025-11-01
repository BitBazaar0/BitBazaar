import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Stack,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  TextField,
  InputAdornment,
  Paper,
  alpha,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { 
  Favorite, 
  Chat, 
  Person, 
  ExitToApp, 
  Login, 
  Add, 
  Menu as MenuIcon,
  Close as CloseIcon,
  Search,
  ArrowForward,
  LightMode,
  DarkMode,
} from '@mui/icons-material';
import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { categories } from '../../config/categories';
import { PartType } from '../../services/listing.service';

const Header = () => {
  const { user, logout } = useAuthStore();
  const { mode, toggleMode } = useThemeStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
    setAnchorEl(null);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/listings?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleCategoryClick = (partType?: PartType, path?: string) => {
    if (partType) {
      navigate(`/listings?partType=${partType}`);
    } else if (path) {
      navigate(path);
    }
    setHoveredCategory(null);
  };

  const getActiveCategory = () => {
    const partType = searchParams.get('partType') as PartType | null;
    const category = categories.find(cat => 
      cat.partTypes?.includes(partType!) || 
      cat.subcategories?.some(sub => sub.partType === partType)
    );
    return category?.name || null;
  };

  const activeCategory = getActiveCategory();

  return (
    <>
      <AppBar position="fixed" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        {/* Main Toolbar */}
        <Toolbar 
          sx={{ 
            maxWidth: '1400px', 
            width: '100%', 
            mx: 'auto',
            px: { xs: 2, sm: 3 },
            minHeight: { xs: 64, sm: 70 }!,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', marginRight: 24 }}>
            <Typography
              variant="h5"
              component="span"
              sx={{
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.02em',
              }}
            >
              BitBazaar
            </Typography>
          </Link>

          {/* Search Bar - Desktop */}
          <Box component="form" onSubmit={handleSearch} sx={{ flexGrow: 1, maxWidth: 600, mx: 3, display: { xs: 'none', md: 'block' } }}>
            <TextField
              fullWidth
              placeholder="Search listings and sellers"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: 'transparent',
                  },
                  '&:hover fieldset': {
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                  },
                },
                '& .MuiInputBase-input': {
                  color: 'text.primary',
                  '&::placeholder': {
                    color: 'text.secondary',
                    opacity: 1,
                  },
                },
              }}
            />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop Actions */}
          <Stack 
            direction="row" 
            spacing={1} 
            alignItems="center"
            sx={{ display: { xs: 'none', md: 'flex' } }}
          >
            {user ? (
              <>
                <Button
                  component={Link}
                  to="/create-listing"
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                  sx={{ ml: 1 }}
                >
                  START SELLING
                </Button>
                
                <IconButton
                  component={Link}
                  to="/favorites"
                  color="inherit"
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { 
                      color: 'text.primary', 
                      backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' 
                    }
                  }}
                >
                  <Favorite fontSize="small" />
                </IconButton>
                
                <IconButton
                  component={Link}
                  to="/chat"
                  color="inherit"
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { 
                      color: 'text.primary', 
                      backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' 
                    }
                  }}
                >
                  <Chat fontSize="small" />
                </IconButton>

                {/* Theme Toggle */}
                <IconButton
                  onClick={toggleMode}
                  color="inherit"
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { 
                      color: 'primary.main', 
                      backgroundColor: alpha('#6366f1', 0.1)
                    }
                  }}
                  aria-label="toggle theme"
                >
                  {mode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
                </IconButton>

                <IconButton
                  onClick={handleProfileMenuOpen}
                  sx={{ 
                    ml: 1,
                    '&:hover': { 
                      backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' 
                    }
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: 'primary.main',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </>
            ) : (
              <>
                <Button
                  component={Link}
                  to="/login"
                  color="inherit"
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { color: 'text.primary' }
                  }}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  color="primary"
                >
                  Sign Up
                </Button>
              </>
            )}
          </Stack>

          {/* Mobile Menu Button */}
          <IconButton
            color="inherit"
            edge="end"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            sx={{ display: { xs: 'flex', md: 'none' }, ml: 1 }}
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </Toolbar>

        {/* Category Navigation Bar */}
        <Box
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            maxWidth: '1400px',
            width: '100%',
            mx: 'auto',
            px: { xs: 2, sm: 3 },
            display: { xs: 'none', md: 'block' },
            position: 'relative',
          }}
        >
          <Stack 
            direction="row" 
            spacing={0}
            sx={{
              height: 48,
              alignItems: 'center',
            }}
          >
            {categories.map((category) => (
              <Box
                key={category.name}
                onMouseEnter={() => setHoveredCategory(category.name)}
                onMouseLeave={() => setHoveredCategory(null)}
                sx={{ position: 'relative' }}
              >
                <Button
                  component={Link}
                  to={category.path}
                  sx={{
                    color: activeCategory === category.name ? 'primary.main' : 'text.secondary',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    px: 2,
                    py: 1.5,
                    minWidth: 'auto',
                    position: 'relative',
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    },
                    '&::after': activeCategory === category.name ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 16,
                      right: 16,
                      height: 2,
                      backgroundColor: 'primary.main',
                    } : {},
                  }}
                >
                  {category.name}
                </Button>

                {/* Dropdown Menu */}
                {hoveredCategory === category.name && category.subcategories && (
                  <Paper
                    onMouseEnter={() => setHoveredCategory(category.name)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      mt: 0.5,
                      minWidth: 600,
                      maxWidth: 800,
                      p: 3,
                      backgroundColor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                      zIndex: 1300,
                    }}
                  >
                    <Grid container spacing={3}>
                      {/* Main Category Link */}
                      <Grid size={{ xs: 12 }}>
                        <Button
                          component={Link}
                          to={category.path}
                          endIcon={<ArrowForward />}
                          sx={{
                            color: 'primary.main',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            fontSize: '0.875rem',
                            mb: 2,
                            '&:hover': {
                              backgroundColor: alpha('#6366f1', 0.1),
                            },
                          }}
                          onClick={() => handleCategoryClick(undefined, category.path)}
                        >
                          All {category.name}
                        </Button>
                      </Grid>

                      {/* Subcategories in columns */}
                      <Grid container spacing={2}>
                        {category.subcategories.map((sub, index) => (
                          <Grid 
                            key={sub.name} 
                            size={{ xs: 12, sm: 6, md: 4 }}
                            sx={{
                              borderRight: index % 3 === 2 ? 'none' : { xs: 'none', md: '1px solid' },
                              borderColor: 'divider',
                              pr: index % 3 === 2 ? 0 : { xs: 0, md: 2 },
                              mb: 1,
                            }}
                          >
                            <Button
                              component={Link}
                              to={`/listings?partType=${sub.partType}`}
                              sx={{
                                color: 'text.primary',
                                textTransform: 'none',
                                fontSize: '0.875rem',
                                justifyContent: 'flex-start',
                                px: 1,
                                py: 0.75,
                                '&:hover': {
                                  backgroundColor: alpha('#6366f1', 0.08),
                                  color: 'primary.main',
                                },
                              }}
                              onClick={() => handleCategoryClick(sub.partType)}
                            >
                              {sub.name}
                            </Button>
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                  </Paper>
                )}
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <Box
            sx={{
              display: { xs: 'block', md: 'none' },
              borderTop: '1px solid',
              borderColor: 'divider',
              py: 2,
              px: 3,
            }}
          >
            {/* Mobile Search */}
            <Box component="form" onSubmit={handleSearch} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Stack spacing={1}>
              {categories.map((category) => (
                <Button
                  key={category.name}
                  component={Link}
                  to={category.path}
                  color="inherit"
                  fullWidth
                  sx={{ justifyContent: 'flex-start', color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {category.name}
                </Button>
              ))}
              <Divider sx={{ my: 1 }} />
              <Button
                onClick={() => {
                  toggleMode();
                  setMobileMenuOpen(false);
                }}
                color="inherit"
                fullWidth
                startIcon={mode === 'dark' ? <LightMode /> : <DarkMode />}
                sx={{ justifyContent: 'flex-start', color: 'text.secondary' }}
              >
                {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </Button>
              <Divider sx={{ my: 1 }} />
              <Button
                component={Link}
                to="/listings"
                color="inherit"
                fullWidth
                sx={{ justifyContent: 'flex-start', color: 'text.secondary' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse All
              </Button>
              {user ? (
                <>
                  <Button
                    component={Link}
                    to="/create-listing"
                    variant="contained"
                    color="primary"
                    fullWidth
                    startIcon={<Add />}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    START SELLING
                  </Button>
                  <Divider sx={{ my: 1 }} />
                  <Button
                    component={Link}
                    to="/favorites"
                    color="inherit"
                    fullWidth
                    startIcon={<Favorite />}
                    sx={{ justifyContent: 'flex-start', color: 'text.secondary' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Favorites
                  </Button>
                  <Button
                    component={Link}
                    to="/chat"
                    color="inherit"
                    fullWidth
                    startIcon={<Chat />}
                    sx={{ justifyContent: 'flex-start', color: 'text.secondary' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Messages
                  </Button>
                  <Button
                    component={Link}
                    to="/profile"
                    color="inherit"
                    fullWidth
                    startIcon={<Person />}
                    sx={{ justifyContent: 'flex-start', color: 'text.secondary' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Button>
                  <Divider sx={{ my: 1 }} />
                  <Button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    color="inherit"
                    fullWidth
                    startIcon={<ExitToApp />}
                    sx={{ justifyContent: 'flex-start', color: 'text.secondary' }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    component={Link}
                    to="/login"
                    color="inherit"
                    fullWidth
                    startIcon={<Login />}
                    sx={{ justifyContent: 'flex-start', color: 'text.secondary' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Button>
                  <Button
                    component={Link}
                    to="/register"
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </Stack>
          </Box>
        )}
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 200,
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }
        }}
      >
        <MenuItem 
          component={Link} 
          to="/profile" 
          onClick={handleProfileMenuClose}
          sx={{ py: 1.5 }}
        >
          <Person sx={{ mr: 1.5, fontSize: 20 }} />
          Profile
        </MenuItem>
        <MenuItem 
          component={Link} 
          to="/favorites" 
          onClick={handleProfileMenuClose}
          sx={{ py: 1.5 }}
        >
          <Favorite sx={{ mr: 1.5, fontSize: 20 }} />
          Favorites
        </MenuItem>
        <MenuItem 
          component={Link} 
          to="/chat" 
          onClick={handleProfileMenuClose}
          sx={{ py: 1.5 }}
        >
          <Chat sx={{ mr: 1.5, fontSize: 20 }} />
          Messages
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={handleLogout}
          sx={{ py: 1.5, color: 'error.main' }}
        >
          <ExitToApp sx={{ mr: 1.5, fontSize: 20 }} />
          Logout
        </MenuItem>
      </Menu>
    </>
  );
};

export default Header;
