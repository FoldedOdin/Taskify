import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiClient, { setAuthDispatch, isAuthenticated as checkIsAuthenticated, clearAuth } from '../utils/api.js';

const AuthContext = createContext();

// Action types for the reducer
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING'
};

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: false,
  error: null
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        loading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    default:
      return state;
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set up API client with auth dispatch
  useEffect(() => {
    setAuthDispatch(dispatch);
  }, []);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      // First check if token exists and is not expired
      if (!checkIsAuthenticated()) {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
        return;
      }

      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
        const response = await apiClient.get('/auth/me');
        
        if (response.data.success) {
          dispatch({
            type: AUTH_ACTIONS.SET_USER,
            payload: response.data.data.user
          });
        } else {
          // Invalid response, clear auth
          clearAuth();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // The API client interceptor will handle the logout
        // but we should also clear local state
        if (error.response?.status === 401) {
          // Token is invalid, interceptor will handle cleanup
          return;
        }
        // For other errors, just clear auth
        clearAuth();
      } finally {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (identifier, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const response = await apiClient.post('/auth/login', {
        identifier,
        password
      });

      if (response.data.success) {
        const { user, token } = response.data.data;
        
        // Store token in localStorage
        localStorage.setItem('token', token);
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token }
        });

        return { success: true, user };
      } else {
        throw new Error(response.data.error?.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (username, email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.REGISTER_START });

      const response = await apiClient.post('/auth/register', {
        username,
        email,
        password
      });

      if (response.data.success) {
        const { user, token } = response.data.data;
        
        // Store token in localStorage
        localStorage.setItem('token', token);
        
        dispatch({
          type: AUTH_ACTIONS.REGISTER_SUCCESS,
          payload: { user, token }
        });

        return { success: true, user };
      } else {
        throw new Error(response.data.error?.message || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Registration failed';
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint if authenticated
      if (state.isAuthenticated) {
        await apiClient.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with logout even if API call fails
    } finally {
      // Use the utility function to clear auth
      clearAuth();
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Update user profile
  const updateUser = (updatedUser) => {
    dispatch({
      type: AUTH_ACTIONS.SET_USER,
      payload: updatedUser
    });
  };

  const value = {
    // State
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    
    // Actions
    login,
    register,
    logout,
    clearError,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
