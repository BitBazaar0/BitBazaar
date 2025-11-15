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
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { forgotPassword } from '../services/auth.service';
import ReCaptchaComponent, { ReCaptchaRef } from '../components/ReCaptcha';
import { getErrorMessage } from '../utils/errorHandler';

interface ForgotPasswordForm {
  email: string;
}

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCaptchaRef>(null);

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordForm>();

  const onSubmit = async (data: ForgotPasswordForm) => {
    // Check reCAPTCHA if site key is configured
    if (RECAPTCHA_SITE_KEY && !recaptchaToken) {
      setError('Please complete the reCAPTCHA verification');
      return;
    }

    try {
      setError(null);
      setSuccess(false);
      setIsLoading(true);
      await forgotPassword(data.email, recaptchaToken || undefined);
      setSuccess(true);
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
                Reset Password
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Enter your email address and we'll send you a link to reset your password
              </Typography>
            </Box>

            {success ? (
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                  Check your email!
                </Typography>
                <Typography variant="body2">
                  If an account exists with this email, a password reset link has been sent. 
                  Please check your inbox and follow the instructions.
                </Typography>
              </Alert>
            ) : (
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
                    rules={{ 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    }}
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
                        autoFocus
                      />
                    )}
                  />

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
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </Stack>
              </Box>
            )}

            <Box sx={{ textAlign: 'center' }}>
              <MuiLink
                component={Link}
                to="/login"
                sx={{
                  color: 'text.secondary',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  '&:hover': {
                    color: 'primary.main',
                    textDecoration: 'underline',
                  },
                }}
              >
                <ArrowBack fontSize="small" />
                Back to Sign In
              </MuiLink>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPasswordPage;

