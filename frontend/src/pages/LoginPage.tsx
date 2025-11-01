import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  Stack,
  Link as MuiLink,
  Divider,
} from '@mui/material';
import { login } from '../services/auth.service';
import { useAuthStore } from '../stores/authStore';

interface LoginForm {
  email: string;
  password: string;
}

const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await login(data);
      setAuth(response.data.user, response.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center', py: 8 }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
          <Stack spacing={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  mb: 1,
                  fontWeight: 700,
                  fontSize: { xs: '2rem', md: '2.5rem' },
                }}
              >
                Welcome Back
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sign in to your BitBazaar account
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Stack spacing={3}>
                <Controller
                  name="email"
                  control={control}
                  rules={{ required: 'Email is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email"
                      type="email"
                      fullWidth
                      placeholder="your@email.com"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      required
                    />
                  )}
                />

                <Controller
                  name="password"
                  control={control}
                  rules={{ required: 'Password is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Password"
                      type="password"
                      fullWidth
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      required
                    />
                  )}
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Stack>
            </Box>

            <Divider>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center' }}>
              <MuiLink
                component={Link}
                to="/register"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Create an account
              </MuiLink>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
