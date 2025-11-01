import { Box, Typography, Button, Stack } from '@mui/material';
import { Search, Add } from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionPath?: string;
  icon?: React.ReactNode;
}

export const EmptyState = ({
  title,
  description,
  actionLabel,
  actionPath,
  icon,
}: EmptyStateProps) => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        px: 3,
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          mx: 'auto',
          mb: 3,
          borderRadius: '50%',
          bgcolor: 'background.paper',
          border: '2px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.secondary',
        }}
      >
        {icon || <Search sx={{ fontSize: 40 }} />}
      </Box>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
        {description}
      </Typography>
      {actionLabel && actionPath && (
        <Button
          component={Link}
          to={actionPath}
          variant="contained"
          color="primary"
          startIcon={<Add />}
          size="large"
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

