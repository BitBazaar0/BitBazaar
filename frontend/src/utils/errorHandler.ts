import { AxiosError } from 'axios';

/**
 * Extracts error message from axios error response
 * Always prioritizes backend message over generic axios messages
 */
export const getErrorMessage = (error: unknown): string => {
  if (!error) {
    return 'An unexpected error occurred';
  }

  // Handle Axios errors
  if (error instanceof Error && 'response' in error) {
    const axiosError = error as AxiosError<{ status?: string; message?: string }>;
    
    // First priority: Backend error message
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    
    // Second priority: Status-specific messages
    if (axiosError.response?.status) {
      const status = axiosError.response.status;
      
      switch (status) {
        case 400:
          return 'Invalid request. Please check your input.';
        case 401:
          // For login attempts, use the backend message if available
          return axiosError.response.data?.message || 'Invalid email or password. Please check your credentials and try again.';
        case 403:
          return axiosError.response.data?.message || 'You do not have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 429:
          return axiosError.response.data?.message || 'Too many requests. Please try again later.';
        case 500:
          return 'Server error. Please try again later.';
        default:
          return `Request failed with status ${status}`;
      }
    }
    
    // Third priority: Network error
    if (axiosError.message === 'Network Error' || !axiosError.response) {
      return 'Network error. Please check your connection and try again.';
    }
  }
  
  // Handle regular Error objects
  if (error instanceof Error) {
    // Don't show generic axios messages
    if (error.message.includes('Request failed with status code')) {
      return 'Request failed. Please try again.';
    }
    return error.message;
  }
  
  // Fallback
  return 'An unexpected error occurred. Please try again.';
};

