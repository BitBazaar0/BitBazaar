import { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Divider,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Message as MessageIcon,
  MonetizationOn as SoldIcon,
  Star as ReviewIcon,
  Favorite as FavoriteIcon,
  Info as SystemIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  Notification,
} from '../services/notification.service';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { mode } = useThemeStore();

  // Fetch unread count
  const { data: unreadData } = useQuery(
    'unread-notifications',
    getUnreadCount,
    {
      enabled: !!user,
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  // Fetch notifications when menu is opened
  const { data: notificationsData, isLoading } = useQuery(
    'notifications',
    () => getNotifications(10, 0),
    {
      enabled: !!user && open,
    }
  );

  const markAsReadMutation = useMutation(markAsRead, {
    onSuccess: () => {
      queryClient.invalidateQueries('notifications');
      queryClient.invalidateQueries('unread-notifications');
    },
  });

  const markAllAsReadMutation = useMutation(markAllAsRead, {
    onSuccess: () => {
      queryClient.invalidateQueries('notifications');
      queryClient.invalidateQueries('unread-notifications');
    },
  });

  const deleteNotificationMutation = useMutation(deleteNotification, {
    onSuccess: () => {
      queryClient.invalidateQueries('notifications');
      queryClient.invalidateQueries('unread-notifications');
    },
  });

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navigate if there's a link
    if (notification.link) {
      navigate(notification.link);
    }

    handleClose();
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDelete = (
    e: React.MouseEvent,
    notificationId: string
  ) => {
    e.stopPropagation();
    deleteNotificationMutation.mutate(notificationId);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'MESSAGE':
        return <MessageIcon fontSize="small" color="primary" />;
      case 'LISTING_SOLD':
        return <SoldIcon fontSize="small" color="success" />;
      case 'REVIEW':
        return <ReviewIcon fontSize="small" color="warning" />;
      case 'FAVORITE':
        return <FavoriteIcon fontSize="small" color="error" />;
      case 'SYSTEM':
        return <SystemIcon fontSize="small" color="info" />;
      default:
        return <NotificationsIcon fontSize="small" />;
    }
  };

  const unreadCount = unreadData?.data.count || 0;
  const notifications = notificationsData?.data.notifications || [];

  if (!user) return null;

  return (
    <>
      <IconButton
        onClick={handleClick}
        color="inherit"
        aria-label="notifications"
        sx={{
          color: 'text.secondary',
          '&:hover': {
            color: 'text.primary',
            backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
          }
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon fontSize="small" />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 500,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              startIcon={<CheckIcon />}
            >
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <>
            {notifications.map((notification) => (
              <MenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                  '&:hover': {
                    bgcolor: notification.isRead ? 'action.hover' : 'action.selected',
                  },
                  py: 1.5,
                }}
              >
                <ListItemIcon>{getIcon(notification.type)}</ListItemIcon>
                <ListItemText
                  primary={notification.title}
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </Typography>
                    </>
                  }
                  primaryTypographyProps={{
                    variant: 'subtitle2',
                    fontWeight: notification.isRead ? 400 : 600,
                  }}
                />
                <IconButton
                  size="small"
                  onClick={(e) => handleDelete(e, notification.id)}
                  sx={{ ml: 1 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </MenuItem>
            ))}
            <Divider />
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Button
                fullWidth
                size="small"
                onClick={() => {
                  navigate('/notifications');
                  handleClose();
                }}
              >
                View All Notifications
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;
