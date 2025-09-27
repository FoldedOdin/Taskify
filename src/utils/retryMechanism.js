/**
 * Retry Mechanism Utility - Provides automatic retry functionality for failed operations
 * with exponential backoff and configurable retry policies
 */

import { getErrorType, isRecoverableError, getRetryDelay, logError } from './errorHandler';

// Default retry configuration
const DEFAULT_RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  exponentialBase: 2,
  jitter: true,
  retryCondition: isRecoverableError
};

/**
 * Creates a retry wrapper for async operations
 * @param {Function} operation - The async operation to retry
 * @param {Object} config - Retry configuration
 * @returns {Function} Wrapped operation with retry logic
 */
export const createRetryWrapper = (operation, config = {}) => {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  
  return async (...args) => {
    let lastError = null;
    let attempt = 1;
    
    while (attempt <= retryConfig.maxAttempts) {
      try {
        console.log(`🔄 Attempt ${attempt}/${retryConfig.maxAttempts} for operation`);
        const result = await operation(...args);
        
        // Success - reset any previous errors and return result
        if (attempt > 1) {
          console.log(`✅ Operation succeeded on attempt ${attempt}`);
        }
        return result;
        
      } catch (error) {
        lastError = error;
        
        console.log(`❌ Operation failed on attempt ${attempt}:`, error.message);
        logError(error, `Retry attempt ${attempt}`, { attempt, maxAttempts: retryConfig.maxAttempts });
        
        // Check if we should retry this error
        if (!retryConfig.retryCondition(error)) {
          console.log(`🚫 Error is not retryable, giving up`);
          throw error;
        }
        
        // If this was the last attempt, throw the error
        if (attempt >= retryConfig.maxAttempts) {
          console.log(`🚫 Max attempts reached, giving up`);
          throw error;
        }
        
        // Calculate delay for next attempt
        const delay = calculateRetryDelay(error, attempt, retryConfig);
        console.log(`⏳ Waiting ${delay}ms before retry attempt ${attempt + 1}`);
        
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, delay));
        attempt++;
      }
    }
    
    // This should never be reached, but just in case
    throw lastError;
  };
};

/**
 * Calculates the delay before the next retry attempt
 * @param {Error} error - The error that occurred
 * @param {number} attempt - Current attempt number
 * @param {Object} config - Retry configuration
 * @returns {number} Delay in milliseconds
 */
const calculateRetryDelay = (error, attempt, config) => {
  // Use error-specific delay if available
  const errorDelay = getRetryDelay(error, attempt);
  if (errorDelay > 0) {
    return Math.min(errorDelay, config.maxDelay);
  }
  
  // Calculate exponential backoff
  let delay = config.baseDelay * Math.pow(config.exponentialBase, attempt - 1);
  
  // Add jitter to prevent thundering herd
  if (config.jitter) {
    delay = delay * (0.5 + Math.random() * 0.5);
  }
  
  // Cap at maximum delay
  return Math.min(delay, config.maxDelay);
};

/**
 * Creates a retry mechanism specifically for todo operations
 * @param {Object} options - Configuration options
 * @returns {Object} Todo operation retry functions
 */
export const createTodoRetryMechanisms = (options = {}) => {
  const defaultConfig = {
    maxAttempts: 3,
    baseDelay: 1000,
    ...options
  };
  
  // Specific configurations for different operations
  const configs = {
    create: { ...defaultConfig, maxAttempts: 2 }, // Less retries for create to avoid duplicates
    update: { ...defaultConfig, maxAttempts: 3 },
    delete: { ...defaultConfig, maxAttempts: 3 },
    toggle: { ...defaultConfig, maxAttempts: 3 },
    reorder: { ...defaultConfig, maxAttempts: 2 }, // Less retries for reorder to avoid conflicts
    search: { ...defaultConfig, maxAttempts: 2, baseDelay: 500 } // Faster retries for search
  };
  
  return {
    retryCreate: createRetryWrapper(async (operation) => operation(), configs.create),
    retryUpdate: createRetryWrapper(async (operation) => operation(), configs.update),
    retryDelete: createRetryWrapper(async (operation) => operation(), configs.delete),
    retryToggle: createRetryWrapper(async (operation) => operation(), configs.toggle),
    retryReorder: createRetryWrapper(async (operation) => operation(), configs.reorder),
    retrySearch: createRetryWrapper(async (operation) => operation(), configs.search)
  };
};

/**
 * Manual retry function for user-initiated retries
 * @param {Function} operation - The operation to retry
 * @param {Object} context - Context information for logging
 * @returns {Promise} Operation result
 */
export const manualRetry = async (operation, context = {}) => {
  console.log(`🔄 Manual retry initiated:`, context);
  
  try {
    const result = await operation();
    console.log(`✅ Manual retry succeeded:`, context);
    return result;
  } catch (error) {
    console.log(`❌ Manual retry failed:`, context, error.message);
    logError(error, 'Manual retry', context);
    throw error;
  }
};

/**
 * Creates a debounced retry function to prevent rapid retry attempts
 * @param {Function} retryFunction - The retry function to debounce
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Function} Debounced retry function
 */
export const createDebouncedRetry = (retryFunction, delay = 1000) => {
  let timeoutId = null;
  
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      retryFunction(...args);
      timeoutId = null;
    }, delay);
  };
};