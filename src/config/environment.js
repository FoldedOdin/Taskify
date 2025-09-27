/**
 * Environment Configuration
 * Centralized configuration for environment variables
 */

// Validate required environment variables
const requiredEnvVars = ['VITE_API_URL'];

const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

if (missingVars.length > 0) {
  console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('Please check your .env file configuration');
}

// Environment configuration object
export const config = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  
  // Application Configuration
  appName: import.meta.env.VITE_APP_NAME || 'Taskify',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',
  
  // Feature flags
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Debug settings
  enableDebugLogs: import.meta.env.DEV,
  enableDevTools: import.meta.env.DEV,
};

// Validation function
export const validateConfig = () => {
  const errors = [];
  
  if (!config.apiUrl) {
    errors.push('API URL is required');
  }
  
  if (!config.apiUrl.startsWith('http')) {
    errors.push('API URL must be a valid HTTP/HTTPS URL');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
  
  console.log('✅ Frontend configuration validated successfully');
  return true;
};

// Initialize configuration validation in development
if (config.isDevelopment) {
  try {
    validateConfig();
  } catch (error) {
    console.error('Configuration Error:', error.message);
  }
}

export default config;