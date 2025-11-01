import api from '../utils/api';

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: string;
  data: {
    user: {
      id: string;
      email: string;
      username: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      location?: string;
      avatar?: string;
    };
    token: string;
  };
}

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', data);
  return response.data;
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

