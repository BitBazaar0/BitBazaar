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
      emailVerified?: boolean;
    };
    token?: string;
    emailSent?: boolean;
  };
  message?: string;
}

export const register = async (data: RegisterData & { recaptchaToken?: string }): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', data);
  return response.data;
};

export const login = async (data: LoginData & { recaptchaToken?: string }): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const verifyEmail = async (token: string) => {
  const response = await api.get('/auth/verify-email', {
    params: { token }
  });
  return response.data;
};

export const resendVerification = async (email: string, recaptchaToken?: string) => {
  const response = await api.post('/auth/resend-verification', { email, recaptchaToken });
  return response.data;
};

export const forgotPassword = async (email: string, recaptchaToken?: string) => {
  const response = await api.post('/auth/forgot-password', { email, recaptchaToken });
  return response.data;
};

export const resetPassword = async (token: string, password: string, recaptchaToken?: string) => {
  const response = await api.post('/auth/reset-password', { token, password, recaptchaToken });
  return response.data;
};

