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
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { updateProfile } from '../services/user.service';
import { useAuthStore } from '../stores/authStore';
import { useQueryClient } from 'react-query';

interface EditProfileForm {
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
}

const EditProfilePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

      <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
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
    </Container>
  );
};

export default EditProfilePage;

