import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Divider,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { ArrowBack, Save, Visibility, VisibilityOff, Lock } from '@mui/icons-material';
import { updateProfile, changePassword } from '../services/user.service';
import { useAuthStore } from '../stores/authStore';
import { useQueryClient } from 'react-query';
import { getErrorMessage } from '../utils/errorHandler';

interface EditProfileForm {
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
}

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const EditProfilePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<EditProfileForm>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      location: user?.location || '',
    }
  });

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm
  } = useForm<ChangePasswordForm>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });

  const onSubmit = async (data: EditProfileForm) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await updateProfile(data);
      
      // Update the auth store with the new user data
      updateUser(response.data.user);
      
      // Invalidate user-related queries
      queryClient.invalidateQueries(['user', user?.id]);
      queryClient.invalidateQueries(['seller', user?.id]);
      
      navigate('/profile');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordForm, e?: React.BaseSyntheticEvent) => {
    // Prevent parent form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Clear previous messages
    setPasswordError(null);
    setPasswordSuccess(null);

    // Client-side validation
    if (data.newPassword !== data.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (data.currentPassword === data.newPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }

    try {
      setIsChangingPassword(true);

      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });

      // Success - clear form and show success message
      setPasswordSuccess('Password changed successfully!');
      resetPasswordForm();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setPasswordSuccess(null);
      }, 3000);
    } catch (err: any) {
      setPasswordError(getErrorMessage(err));
      // DO NOT reset form on error - keep the values so user can correct them
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>Please log in to edit your profile</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/profile')}
          sx={{ 
            mb: 3,
            color: 'text.secondary',
            '&:hover': { color: 'text.primary' }
          }}
        >
          Back to Profile
        </Button>
        <Typography 
          variant="h2" 
          component="h1" 
          sx={{ 
            mb: 1,
            fontSize: { xs: '2rem', md: '2.5rem' },
          }}
        >
          Edit Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Update your account information
        </Typography>
      </Box>

      {/* Profile Information Form */}
      <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, mb: 4 }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={4}>
            {/* Account Info */}
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Account Information
              </Typography>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Username
                  </Typography>
                  <TextField
                    value={user.username}
                    fullWidth
                    disabled
                    sx={{
                      '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: 'text.secondary',
                      },
                    }}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Email
                  </Typography>
                  <TextField
                    value={user.email}
                    fullWidth
                    disabled
                    sx={{
                      '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: 'text.secondary',
                      },
                    }}
                  />
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Personal Information */}
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Personal Information
              </Typography>
              <Stack spacing={3}>
                <Box>
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
                </Box>

                <Box>
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
                </Box>

                <Box>
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
                </Box>

                <Box>
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
                </Box>
              </Stack>
            </Box>

            {/* Submit Buttons */}
            <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/profile')}
                fullWidth
                size="large"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isLoading}
                fullWidth
                size="large"
                startIcon={isLoading ? <></> : <Save />}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>

      {/* Change Password Form - Separate from profile form */}
      <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Lock fontSize="small" />
          Change Password
        </Typography>
        
        <Box 
          component="form" 
          onSubmit={handlePasswordSubmit(onPasswordSubmit)}
        >
          {passwordError && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2, 
                borderRadius: 2,
                '& .MuiAlert-message': {
                  width: '100%'
                }
              }}
              onClose={() => setPasswordError(null)}
            >
              {passwordError}
            </Alert>
          )}
          
          {passwordSuccess && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              {passwordSuccess}
            </Alert>
          )}

          <Stack spacing={3}>
            <Controller
              name="currentPassword"
              control={passwordControl}
              rules={{ required: 'Current password is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Current Password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  fullWidth
                  error={!!passwordErrors.currentPassword}
                  helperText={passwordErrors.currentPassword?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          edge="end"
                        >
                          {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Controller
              name="newPassword"
              control={passwordControl}
              rules={{ 
                required: 'New password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="New Password"
                  type={showNewPassword ? 'text' : 'password'}
                  fullWidth
                  error={!!passwordErrors.newPassword}
                  helperText={passwordErrors.newPassword?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Controller
              name="confirmPassword"
              control={passwordControl}
              rules={{ required: 'Please confirm your new password' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  fullWidth
                  error={!!passwordErrors.confirmPassword}
                  helperText={passwordErrors.confirmPassword?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Button
              type="submit"
              variant="outlined"
              color="primary"
              disabled={isChangingPassword}
              sx={{ alignSelf: 'flex-start' }}
            >
              {isChangingPassword ? 'Changing...' : 'Change Password'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditProfilePage;

