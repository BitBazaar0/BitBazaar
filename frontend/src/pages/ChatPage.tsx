import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  IconButton,
  Badge,
  Stack,
  Divider,
  Avatar,
  alpha,
} from '@mui/material';
import { Send, Chat as ChatIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { getUserChats, getChatMessages, sendMessage } from '../services/chat.service';
import { useAuthStore } from '../stores/authStore';

const ChatPage = () => {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const chatIdFromUrl = searchParams.get('chatId');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(chatIdFromUrl || null);
  const [messageContent, setMessageContent] = useState('');
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chatsData } = useQuery('user-chats', getUserChats);

  useEffect(() => {
    if (chatIdFromUrl && chatsData?.data.chats) {
      const chatExists = chatsData.data.chats.find((c) => c.id === chatIdFromUrl);
      if (chatExists && selectedChatId !== chatIdFromUrl) {
        setSelectedChatId(chatIdFromUrl);
        setSearchParams({});
      }
    }
  }, [chatIdFromUrl, chatsData?.data.chats, selectedChatId, setSearchParams]);

  const { data: messagesData } = useQuery(
    ['chat-messages', selectedChatId],
    () => getChatMessages(selectedChatId!),
    { enabled: !!selectedChatId }
  );

  const sendMessageMutation = useMutation(
    () => sendMessage(selectedChatId!, messageContent),
    {
      onSuccess: () => {
        setMessageContent('');
        queryClient.invalidateQueries(['chat-messages', selectedChatId]);
        queryClient.invalidateQueries('user-chats');
      }
    }
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData?.data.messages]);

  const selectedChat = chatsData?.data.chats.find((c) => c.id === selectedChatId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageContent.trim() && selectedChatId) {
      sendMessageMutation.mutate();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Typography 
        variant="h2" 
        component="h1" 
        sx={{ 
          mb: 4,
          fontSize: { xs: '2rem', md: '2.5rem' },
        }}
      >
        Messages
      </Typography>
      
      <Paper 
        sx={{ 
          height: { xs: 'calc(100vh - 250px)', md: 'calc(100vh - 300px)' }, 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          overflow: 'hidden',
          borderRadius: 3,
        }}
      >
        {/* Chat List */}
        <Box
          sx={{
            width: { xs: '100%', md: 320 },
            borderRight: { xs: 'none', md: '1px solid' },
            borderBottom: { xs: '1px solid', md: 'none' },
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Conversations
            </Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
            {chatsData?.data.chats.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <ChatIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  No conversations yet
                </Typography>
              </Box>
            ) : (
              chatsData?.data.chats.map((chat) => (
                <Box
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  sx={{
                    p: 2.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    bgcolor: selectedChatId === chat.id ? alpha('#6366f1', 0.1) : 'transparent',
                    transition: 'background-color 0.2s ease',
                    '&:hover': {
                      bgcolor: selectedChatId === chat.id ? alpha('#6366f1', 0.15) : alpha('#6366f1', 0.05),
                    },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: 'primary.main',
                        fontSize: '0.875rem',
                      }}
                    >
                      {chat.listing?.title?.charAt(0) || 'L'}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: 600,
                          mb: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {chat.listing?.title || 'Listing'}
                      </Typography>
                      {chat.lastMessage && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {chat.lastMessage.content.substring(0, 40)}
                          {chat.lastMessage.content.length > 40 ? '...' : ''}
                        </Typography>
                      )}
                    </Box>
                    {chat.unreadCount && chat.unreadCount > 0 && (
                      <Badge 
                        badgeContent={chat.unreadCount} 
                        color="primary"
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: '0.75rem',
                          },
                        }}
                      />
                    )}
                  </Stack>
                </Box>
              ))
            )}
          </Box>
        </Box>

        {/* Chat Messages */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <Box 
                sx={{ 
                  p: 3, 
                  borderBottom: '1px solid', 
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {selectedChat.listing?.title || 'Chat'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedChat.buyerId === user?.id
                    ? `Seller`
                    : `Buyer`}
                </Typography>
              </Box>

              {/* Messages */}
              <Box 
                sx={{ 
                  flexGrow: 1, 
                  overflowY: 'auto', 
                  p: 3,
                  bgcolor: 'background.default',
                }}
              >
                <Stack spacing={2}>
                  {messagesData?.data.messages.map((message) => (
                    <Box
                      key={message.id}
                      sx={{
                        display: 'flex',
                        justifyContent: message.senderId === user?.id ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <Paper
                        sx={{
                          p: 2,
                          maxWidth: '75%',
                          borderRadius: 3,
                          bgcolor: message.senderId === user?.id 
                            ? 'primary.main' 
                            : 'background.paper',
                          color: message.senderId === user?.id ? 'white' : 'text.primary',
                          borderBottomRightRadius: message.senderId === user?.id ? 4 : 3,
                          borderBottomLeftRadius: message.senderId === user?.id ? 3 : 4,
                          boxShadow: message.senderId === user?.id 
                            ? '0 2px 8px rgba(99, 102, 241, 0.3)'
                            : '0 1px 3px rgba(0, 0, 0, 0.2)',
                        }}
                      >
                        <Typography variant="body1" sx={{ mb: 0.5 }}>
                          {message.content}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            opacity: 0.7,
                            fontSize: '0.75rem',
                          }}
                        >
                          {format(new Date(message.createdAt), 'p')}
                        </Typography>
                      </Paper>
                    </Box>
                  ))}
                  <div ref={messagesEndRef} />
                </Stack>
              </Box>

              {/* Message Input */}
              <Box 
                sx={{ 
                  p: 2, 
                  borderTop: '1px solid', 
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              >
                <form onSubmit={handleSendMessage}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Type a message..."
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                        },
                      }}
                    />
                    <IconButton
                      type="submit"
                      color="primary"
                      disabled={!messageContent.trim() || sendMessageMutation.isLoading}
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                        '&:disabled': {
                          bgcolor: 'action.disabledBackground',
                          color: 'action.disabled',
                        },
                      }}
                    >
                      <Send />
                    </IconButton>
                  </Stack>
                </form>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                color: 'text.secondary',
                p: 4,
              }}
            >
              <ChatIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                Select a conversation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose a chat from the list to start messaging
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default ChatPage;
