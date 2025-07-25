import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { logger } from '../utils/logger';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000/api'),  // Development vs production URLs
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      logger.debug('API', 'Added auth token to request', {
        url: config.url,
        method: config.method,
        tokenPrefix: token.substring(0, 10) + '...'
      });
    } else {
      logger.debug('API', 'No auth token available for request', {
        url: config.url,
        method: config.method
      });
    }
    
    logger.info('API', `Request: ${config.method?.toUpperCase()} ${config.url}`, {
      method: config.method?.toUpperCase(),
      url: config.url,
      params: config.params,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    logger.error('API', `Request Error: ${error.message}`, {
      url: error.config?.url,
      method: error.config?.method,
      stack: error.stack
    });
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response: AxiosResponse) => {
    logger.info('API', `Response: ${response.status} ${response.statusText} - ${response.config.url}`, {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      responseData: response.data ? '...' : 'No data'
    });
    
    logger.debug('API', `Response Details for ${response.config.url}`, {
      status: response.status,
      data: response.data
    });
    
    return response;
  },
  (error: AxiosError) => {
    const errorData = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      error: error.message,
      stack: error.stack
    };
    
    if (error.response?.status === 401) {
      logger.warn('API', `Auth Error (401): ${error.message}`, errorData);
      
      // Clear auth data and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        logger.info('API', 'Redirecting to login due to auth error');
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      logger.warn('API', `Forbidden (403): ${error.message}`, errorData);
    } else if (error.response?.status === 404) {
      logger.warn('API', `Not Found (404): ${error.config?.url}`, errorData);
    } else if (error.response?.status >= 500) {
      logger.error('API', `Server Error (${error.response?.status}): ${error.message}`, errorData);
    } else {
      logger.error('API', `Error: ${error.message}`, errorData);
    }
    
    return Promise.reject(error);
  }
);

export { api };
export default api;