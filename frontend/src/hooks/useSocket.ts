import { useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { socketService } from '../services/socket.service';
import { useAuthStore } from '../stores/authStore';

/**
 * Hook to manage Socket.IO connection and listen for real-time events
 */
export const useSocket = () => {
  const { user, token } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user || !token) {
      // User not logged in, disconnect if connected
      socketService.disconnect();
      return;
    }

    // Connect to Socket.IO server
    const socket = socketService.connect(user.id, token);

    // Listen for new notifications
    socket.on('new-notification', () => {
      // Invalidate queries to refetch notification data
      queryClient.invalidateQueries('notifications');
      queryClient.invalidateQueries('unread-notifications');
    });

    // Listen for new messages
    socket.on('new-message', () => {
      // Invalidate chat queries to show new messages
      queryClient.invalidateQueries('user-chats');
      queryClient.invalidateQueries('chat-messages');
    });

    // Cleanup on unmount
    return () => {
      socket.off('new-notification');
      socket.off('new-message');
    };
  }, [user, token, queryClient]);

  return {
    socket: socketService.getSocket(),
    isConnected: socketService.isConnected(),
  };
};
