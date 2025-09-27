/**
 * Production Logger Utility
 * Conditionally enables/disables console logging based on environment
 */

const isDevelopment = import.meta.env.DEV;
const isDebugEnabled = isDevelopment && false; // Set to true to enable debug logs in development

/**
 * Production-safe console logger
 * Only logs in development mode when debug is enabled
 */
export const prodLogger = {
  log: (...args) => {
    if (isDebugEnabled) {
      console.log(...args);
    }
  },
  
  error: (...args) => {
    if (isDebugEnabled) {
      console.error(...args);
    }
  },
  
  warn: (...args) => {
    if (isDebugEnabled) {
      console.warn(...args);
    }
  },
  
  info: (...args) => {
    if (isDebugEnabled) {
      console.info(...args);
    }
  },
  
  debug: (...args) => {
    if (isDebugEnabled) {
      console.debug(...args);
    }
  }
};

/**
 * Critical logger - always logs errors in production for monitoring
 */
export const criticalLogger = {
  error: (...args) => {
    console.error(...args);
  },
  
  warn: (...args) => {
    if (isDevelopment || import.meta.env.PROD) {
      console.warn(...args);
    }
  }
};

export default prodLogger;