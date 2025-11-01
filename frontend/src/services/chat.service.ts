import api from '../utils/api';

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  imageUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Chat {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
  listing?: any;
  lastMessage?: Message;
  unreadCount?: number;
}

export interface ChatsResponse {
  status: string;
  data: {
    chats: Chat[];
  };
}

export interface MessagesResponse {
  status: string;
  data: {
    messages: Message[];
  };
}

export const getUserChats = async (): Promise<ChatsResponse> => {
  const response = await api.get<ChatsResponse>('/chat');
  return response.data;
};

export const getChatMessages = async (chatId: string): Promise<MessagesResponse> => {
  const response = await api.get<MessagesResponse>(`/chat/${chatId}`);
  return response.data;
};

export const createOrGetChat = async (listingId: string, content?: string, imageUrl?: string) => {
  const response = await api.post('/chat', { listingId, content, imageUrl });
  return response.data;
};

export const sendMessage = async (chatId: string, content: string, imageUrl?: string) => {
  const response = await api.post(`/chat/${chatId}/messages`, { content, imageUrl });
  return response.data;
};

