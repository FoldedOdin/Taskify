
import axios from 'axios';
import config from '../config/environment.js';

const API_BASE_URL = `${config.apiUrl}/api`;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store reference to auth context dispatch function
let authDispatch = null;

// Function to set auth dispatch (called from AuthContext)
export const setAuthDispatch = (dispatch) => {
  authDispatch = dispatch;
};

// Utility function to check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if token has expired (exp is in seconds, Date.now() is in milliseconds)
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    // If we can't decode the token, consider it expired
    return true;
  }
};

// Function to handle token expiration
const handleTokenExpiration = () => {
  localStorage.removeItem('token');
  if (authDispatch) {
    authDispatch({ type: 'LOGOUT' });
  }
  
  // Redirect to home page to show login modal
  if (window.location.pathname !== '/') {
    window.location.href = '/';
  }
};

// Request interceptor to add JWT token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Check if token is expired before making the request
      if (isTokenExpired(token)) {
        console.warn('Token expired before request. Logging out user.');
        handleTokenExpiration();
        return Promise.reject(new Error('Token expired'));
      }
      
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;
    
    // Handle authentication errors
    if (response?.status === 401) {
      const errorCode = response?.data?.error?.code;
      
      // Handle different types of authentication errors
      if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'INVALID_TOKEN' || !errorCode) {
        // Token is invalid or expired
        localStorage.removeItem('token');
        
        // If we have access to auth dispatch, logout the user
        if (authDispatch) {
          authDispatch({ type: 'LOGOUT' });
        }
        
        // Show user-friendly message for token expiration
        if (errorCode === 'TOKEN_EXPIRED') {
          console.warn('Your session has expired. Please log in again.');
          // You could also show a toast notification here
        }
        
        // Don't redirect if this is an auth endpoint (login/register)
        const isAuthEndpoint = config?.url?.includes('/auth/');
        if (!isAuthEndpoint) {
          // Redirect to home page to show login modal
          if (window.location.pathname !== '/') {
            window.location.href = '/';
          }
        }
      }
    }
    
    // Handle forbidden access (user doesn't have permission)
    if (response?.status === 403) {
      console.error('Access forbidden. You do not have permission to perform this action.');
      // You could show a toast notification here
    }
    
    // Handle server errors
    if (response?.status >= 500) {
      console.error('Server error occurred. Please try again later.');
      // You could show a toast notification here
    }
    
    // Handle network errors
    if (!response) {
      console.error('Network error. Please check your internet connection.');
      // You could show a toast notification here
    }
    
    return Promise.reject(error);
  }
);

// Utility function to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!(token && !isTokenExpired(token));
};

// Utility function to get current user token
export const getToken = () => {
  const token = localStorage.getItem('token');
  return token && !isTokenExpired(token) ? token : null;
};

// Utility function to clear authentication
export const clearAuth = () => {
  localStorage.removeItem('token');
  if (authDispatch) {
    authDispatch({ type: 'LOGOUT' });
  }
};

export default apiClient;
