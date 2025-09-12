// Authentication context - will be implemented in phase 8
import { createContext, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Authentication logic will be implemented later
  const value = {
    user: null,
    isAuthenticated: false,
    login: () => {},
    logout: () => {},
    register: () => {},
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
