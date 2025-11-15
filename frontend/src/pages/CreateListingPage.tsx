import { useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQueryClient } from 'react-query';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  Stack,
  MenuItem,
  Card,
  CardMedia,
  IconButton,
  CircularProgress,
  Divider,
  alpha,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { CloudUpload, Delete, AddPhotoAlternate, ArrowBack } from '@mui/icons-material';
import { createListing, ListingCreateInput, Condition } from '../services/listing.service';
import { useCategories } from '../hooks/useCategories';
import { uploadImages } from '../services/upload.service';

const CreateListingPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<ListingCreateInput & { imageUrls: string }>();

  // Fetch categories using shared hook (cached, deduplicated)
  const { data: categories = [] } = useCategories();

  const conditions: Condition[] = ['new', 'used', 'refurbished'];

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    Array.from(files).forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        setError(`${file.name} is not a valid image type. Only JPEG, PNG, WEBP, and GIF are allowed.`);
        return;
      }
      if (file.size > maxSize) {
        setError(`${file.name} is too large. Maximum file size is 10MB.`);
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length === 0) return;

    const remainingSlots = 10 - imageFiles.length;
    if (validFiles.length > remainingSlots) {
      setError(`Maximum 10 images allowed. You can add ${remainingSlots} more.`);
      validFiles.splice(remainingSlots);
    }

    const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file));
    setImages([...images, ...newPreviewUrls]);
    setImageFiles([...imageFiles, ...validFiles]);
    setError(null);
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(images[index]);
    setImages(images.filter((_, i) => i !== index));
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: any) => {
    try {
      setError(null);
      setIsLoading(true);

      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        setIsUploadingImages(true);
        try {
          imageUrls = await uploadImages(imageFiles);
          setIsUploadingImages(false);
        } catch (uploadErr: any) {
          setIsUploadingImages(false);
          throw new Error(uploadErr.response?.data?.message || 'Failed to upload images. Please try again.');
        }
      }

      const listingData: ListingCreateInput = {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        brand: data.brand || undefined,
        model: data.model || undefined,
        condition: data.condition,
        price: Number(data.price),
        location: data.location,
        images: imageUrls
      };

      const response = await createListing(listingData);
      
      images.forEach((url) => URL.revokeObjectURL(url));
      
      // Invalidate all listing queries to refresh the listings
      queryClient.invalidateQueries('featured-listings');
      queryClient.invalidateQueries(['listings']);
      queryClient.invalidateQueries(['user-listings']);
      
      navigate(`/listings/${response.data.listing.id}`);
    } catch (err: any) {
      setError(err.message || err.response?.data?.message || 'Failed to create listing. Please try again.');
    } finally {
      setIsLoading(false);
      setIsUploadingImages(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ 
            mb: 3,
            color: 'text.secondary',
            '&:hover': { color: 'text.primary' }
          }}
        >
          Back
        </Button>
        <Typography 
          variant="h2" 
          component="h1" 
          sx={{ 
            mb: 1,
            fontSize: { xs: '2rem', md: '2.5rem' },
          }}
        >
          Create New Listing
        </Typography>
        <Typography variant="body1" color="text.secondary">
          List your PC parts and gaming gear for sale
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
            {/* Basic Information */}
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Basic Information
              </Typography>
              <Stack spacing={3}>
                <Controller
                  name="title"
                  control={control}
                  rules={{
                    required: 'Title is required',
                    minLength: { value: 3, message: 'Title must be at least 3 characters' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Title"
                      fullWidth
                      placeholder="e.g., NVIDIA RTX 3080 - Excellent Condition"
                      error={!!errors.title}
                      helperText={errors.title?.message}
                      required
                    />
                  )}
                />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="categoryId"
                      control={control}
                      rules={{ required: 'Category is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          label="Category"
                          fullWidth
                          error={!!errors.categoryId}
                          helperText={errors.categoryId?.message}
                          required
                        >
                          <MenuItem value="">Select category</MenuItem>
                          {categories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                              {category.displayName || category.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="condition"
                      control={control}
                      rules={{ required: 'Condition is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          label="Condition"
                          fullWidth
                          error={!!errors.condition}
                          helperText={errors.condition?.message}
                          required
                        >
                          <MenuItem value="">Select condition</MenuItem>
                          {conditions.map((condition) => (
                            <MenuItem key={condition} value={condition}>
                              {condition.charAt(0).toUpperCase() + condition.slice(1)}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="brand"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Brand"
                          fullWidth
                          placeholder="e.g., NVIDIA"
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="model"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Model"
                          fullWidth
                          placeholder="e.g., RTX 3080"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </Box>

            <Divider />

            {/* Pricing & Location */}
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Pricing & Location
              </Typography>
              <Stack spacing={3}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="price"
                      control={control}
                      rules={{
                        required: 'Price is required',
                        min: { value: 0, message: 'Price must be positive' }
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="number"
                          label="Price (MKD)"
                          fullWidth
                          placeholder="0"
                          error={!!errors.price}
                          helperText={errors.price?.message}
                          required
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="location"
                      control={control}
                      rules={{ required: 'Location is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Location"
                          fullWidth
                          placeholder="e.g., Skopje"
                          error={!!errors.location}
                          helperText={errors.location?.message}
                          required
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </Box>

            <Divider />

            {/* Description */}
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Description
              </Typography>
              <Controller
                name="description"
                control={control}
                rules={{
                  required: 'Description is required',
                  minLength: { value: 10, message: 'Description must be at least 10 characters' }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    multiline
                    rows={6}
                    placeholder="Describe your item in detail..."
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    required
                  />
                )}
              />
            </Box>

            <Divider />

            {/* Images */}
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Images ({images.length}/10)
              </Typography>
              
              {/* Drag and Drop Area */}
              <Box
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
                sx={{
                  border: '2px dashed',
                  borderColor: isDragging ? 'primary.main' : 'divider',
                  borderRadius: 3,
                  p: 4,
                  textAlign: 'center',
                  bgcolor: isDragging ? alpha('#6366f1', 0.05) : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  mb: 3,
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: alpha('#6366f1', 0.03),
                  },
                }}
              >
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  style={{ display: 'none' }}
                  onChange={handleFileInputChange}
                />
                <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.7 }} />
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                  Drag and drop images here, or click to select
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  JPEG, PNG, WEBP, or GIF (max 10MB each, up to 10 images)
                </Typography>
              </Box>

              {/* Image Previews */}
              {images.length > 0 && (
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  {images.map((url, index) => (
                    <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
                      <Card sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
                        <CardMedia
                          component="img"
                          height="140"
                          image={url}
                          alt={`Preview ${index + 1}`}
                          sx={{ objectFit: 'cover' }}
                        />
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'error.main',
                            color: 'white',
                            '&:hover': {
                              bgcolor: 'error.dark',
                            },
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Upload Progress */}
              {isUploadingImages && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                  <CircularProgress size={24} />
                  <Typography variant="body2" color="text.secondary">
                    Uploading images...
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Submit Buttons */}
            <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                fullWidth
                size="large"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isLoading || isUploadingImages}
                fullWidth
                size="large"
                startIcon={isLoading || isUploadingImages ? <CircularProgress size={20} /> : <AddPhotoAlternate />}
              >
                {isUploadingImages ? 'Uploading...' : isLoading ? 'Creating...' : 'Create Listing'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateListingPage;
