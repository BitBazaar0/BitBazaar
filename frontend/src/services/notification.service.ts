import api from '../utils/api';

export interface Notification {
  id: string;
  userId: string;
  type: 'MESSAGE' | 'LISTING_SOLD' | 'REVIEW' | 'FAVORITE' | 'SYSTEM';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}

/**
 * Get all notifications
 */
export const getNotifications = async (limit = 20, offset = 0) => {
  const response = await api.get<{ data: NotificationsResponse }>('/notifications', {
    params: { limit, offset },
  });
  return response.data;
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async () => {
  const response = await api.get<{ data: { count: number } }>('/notifications/unread-count');
  return response.data;
};

/**
 * Mark notification as read
 */
export const markAsRead = async (id: string) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async () => {
  const response = await api.patch('/notifications/mark-all-read');
  return response.data;
};

/**
 * Delete notification
 */
export const deleteNotification = async (id: string) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};
