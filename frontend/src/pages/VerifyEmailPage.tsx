import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
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
import { CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import { verifyEmail } from '../services/auth.service';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. Please request a new verification email.');
        return;
      }

      try {
        await verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been verified successfully!');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Failed to verify email. The link may be invalid or expired.');
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <Box sx={{ minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center', py: 8 }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
          <Stack spacing={4} sx={{ textAlign: 'center' }}>
            {status === 'loading' && (
              <>
                <CircularProgress size={60} sx={{ mx: 'auto' }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Verifying your email...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please wait while we verify your email address.
                </Typography>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle sx={{ fontSize: 80, color: 'success.main', mx: 'auto' }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Email Verified!
                </Typography>
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  {message}
                </Alert>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  You can now log in to your account. Redirecting to login page...
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/login')}
                  fullWidth
                >
                  Go to Login
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mx: 'auto' }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Verification Failed
                </Typography>
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {message}
                </Alert>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/login')}
                  >
                    Go to Login
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/register')}
                  >
                    Create New Account
                  </Button>
                </Stack>
              </>
            )}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default VerifyEmailPage;

