import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Alert,
  Paper,
  Stack,
  Button,
  CircularProgress,
} from '@mui/material';
import { Email, Refresh } from '@mui/icons-material';
import { resendVerification } from '../services/auth.service';
import ReCaptchaComponent, { ReCaptchaRef } from '../components/ReCaptcha';
import { getErrorMessage } from '../utils/errorHandler';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

const VerifyEmailWaitingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState<string>('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCaptchaRef>(null);

  useEffect(() => {
    // Get email from location state (passed from registration)
    const state = location.state as { email?: string } | null;
    if (state?.email) {
      setEmail(state.email);
    } else {
      // If no email in state, redirect to register
      navigate('/register');
    }
  }, [location, navigate]);

  const handleResend = async () => {
    if (!email) return;

    // Check reCAPTCHA if site key is configured
    if (RECAPTCHA_SITE_KEY && !recaptchaToken) {
      setResendError('Please complete the reCAPTCHA verification');
      return;
    }

    try {
      setIsResending(true);
      setResendError(null);
      setResendSuccess(false);
      await resendVerification(email, recaptchaToken || undefined);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
      // Reset reCAPTCHA on success
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setResendError(errorMessage);
      // Reset reCAPTCHA on error
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center', py: 8 }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
          <Stack spacing={4} sx={{ textAlign: 'center' }}>
            <Email sx={{ fontSize: 80, color: 'primary.main', mx: 'auto' }} />
            
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                Verify Your Email
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                We've sent a verification link to:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
                {email || 'your email address'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please check your inbox and click the verification link to activate your account.
              </Typography>
            </Box>

            <Alert severity="info" sx={{ borderRadius: 2, textAlign: 'left' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Didn't receive the email?
              </Typography>
              <Typography variant="body2">
                Check your spam folder, or click the button below to resend the verification email.
              </Typography>
            </Alert>

            {resendSuccess && (
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                Verification email sent! Please check your inbox.
              </Alert>
            )}

            {resendError && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {resendError}
              </Alert>
            )}

            <Stack spacing={2}>
              {RECAPTCHA_SITE_KEY && (
                <ReCaptchaComponent
                  ref={recaptchaRef}
                  siteKey={RECAPTCHA_SITE_KEY}
                  onChange={(token) => setRecaptchaToken(token)}
                  onError={() => {
                    setResendError('reCAPTCHA verification failed. Please try again.');
                    setRecaptchaToken(null);
                  }}
                />
              )}

              <Button
                variant="contained"
                startIcon={isResending ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
                onClick={handleResend}
                disabled={isResending || !email}
                fullWidth
              >
                {isResending ? 'Sending...' : 'Resend Verification Email'}
              </Button>

              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
                fullWidth
              >
                Go to Login
              </Button>
            </Stack>

            <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">
                Already verified?{' '}
                <Link 
                  to="/login" 
                  style={{ 
                    color: 'inherit', 
                    textDecoration: 'underline',
                    fontWeight: 600 
                  }}
                >
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default VerifyEmailWaitingPage;

