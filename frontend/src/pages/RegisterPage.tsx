import { useState, useRef } from 'react';
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
import Grid from '@mui/material/Grid';
import { register } from '../services/auth.service';
import { useAuthStore } from '../stores/authStore';
import ReCaptchaComponent, { ReCaptchaRef } from '../components/ReCaptcha';
import { getErrorMessage } from '../utils/errorHandler';

interface RegisterForm {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
}

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCaptchaRef>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterForm>();

  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Check reCAPTCHA if site key is configured
    if (RECAPTCHA_SITE_KEY && !recaptchaToken) {
      setError('Please complete the reCAPTCHA verification');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      const { confirmPassword, ...registerData } = data;
      const response = await register({
        ...registerData,
        recaptchaToken: recaptchaToken || undefined
      });
      
      // DO NOT log in the user - redirect to verification waiting page
      // Pass email in state so the waiting page can resend verification
      navigate('/verify-email-waiting', {
        state: { email: registerData.email }
      });
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      // Reset reCAPTCHA on error
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ py: { xs: 4, md: 8 } }}>
      <Container maxWidth="md">
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
                Join BitBazaar
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create your account to start buying and selling
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}
              

              <Stack spacing={3}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
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
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="username"
                      control={control}
                      rules={{ required: 'Username is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Username"
                          fullWidth
                          placeholder="username"
                          error={!!errors.username}
                          helperText={errors.username?.message}
                          required
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="password"
                      control={control}
                      rules={{ required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } }}
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
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="confirmPassword"
                      control={control}
                      rules={{
                        required: 'Please confirm your password',
                        validate: (value) => value === password || 'Passwords do not match'
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Confirm Password"
                          type="password"
                          fullWidth
                          error={!!errors.confirmPassword}
                          helperText={errors.confirmPassword?.message}
                          required
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Optional Information
                  </Typography>
                </Divider>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="firstName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="First Name"
                          fullWidth
                          placeholder="John"
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="lastName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Last Name"
                          fullWidth
                          placeholder="Doe"
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Phone"
                          fullWidth
                          placeholder="+38970123456"
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="location"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Location"
                          fullWidth
                          placeholder="Skopje"
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                {RECAPTCHA_SITE_KEY && (
                  <ReCaptchaComponent
                    ref={recaptchaRef}
                    siteKey={RECAPTCHA_SITE_KEY}
                    onChange={(token) => setRecaptchaToken(token)}
                    onError={() => {
                      setError('reCAPTCHA verification failed. Please try again.');
                      setRecaptchaToken(null);
                    }}
                  />
                )}

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </Stack>
            </Box>

            <Divider>
              <Typography variant="body2" color="text.secondary">
                Already have an account?
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center' }}>
              <MuiLink
                component={Link}
                to="/login"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Sign in instead
              </MuiLink>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;
