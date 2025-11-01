import { Snackbar, Alert, AlertColor } from '@mui/material';
import { useEffect, useState } from 'react';

interface ToastProps {
  open: boolean;
  message: string;
  severity?: AlertColor;
  duration?: number;
  onClose: () => void;
}

export const Toast = ({ 
  open, 
  message, 
  severity = 'success', 
  duration = 4000,
  onClose 
}: ToastProps) => {
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setIsOpen(false);
    onClose();
  };

  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{
        '& .MuiSnackbarContent-root': {
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        },
      }}
    >
      <Alert 
        onClose={handleClose} 
        severity={severity} 
        variant="filled"
        sx={{ 
          width: '100%',
          borderRadius: 2,
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

// Toast hook for easy usage
export const useToast = () => {
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity?: AlertColor;
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showToast = (message: string, severity: AlertColor = 'success') => {
    setToast({ open: true, message, severity });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, open: false }));
  };

  return {
    toast,
    showToast,
    hideToast,
  };
};

