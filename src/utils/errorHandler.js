/**
 * Centralized error handling utilities for the Taskify application
 */

// Error types for categorization
export const ERROR_TYPES = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  SERVER: 'server',
  AUTHENTICATION: 'authentication',
  PERMISSION: 'permission',
  UNKNOWN: 'unknown'
};

// User-friendly error messages
export const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: 'Unable to connect to the server. Please check your internet connection and try again.',
  [ERROR_TYPES.VALIDATION]: 'Please check your input and try again.',
  [ERROR_TYPES.SERVER]: 'Something went wrong on our end. Please try again in a moment.',
  [ERROR_TYPES.AUTHENTICATION]: 'Your session has expired. Please refresh the page and try again.',
  [ERROR_TYPES.PERMISSION]: 'You don\'t have permission to perform this action.',
  [ERROR_TYPES.UNKNOWN]: 'An unexpected error occurred. Please try again.'
};

// Operation-specific error messages
export const OPERATION_ERRORS = {
  CREATE_TODO: 'Failed to create task. Please try again.',
  UPDATE_TODO: 'Failed to update task. Please try again.',
  DELETE_TODO: 'Failed to delete task. Please try again.',
  TOGGLE_COMPLETE: 'Failed to update task completion status. Please try again.',
  REORDER_TODOS: 'Failed to reorder tasks. Please try again.',
  FETCH_TODOS: 'Failed to load tasks. Please try again.',
  SEARCH_TODOS: 'Failed to search tasks. Please try again.'
};

/**
 * Determines the error type based on the error object
 * @param {Error} error - The error object
 * @returns {string} The error type
 */
export const getErrorType = (error) => {
  if (!error) return ERROR_TYPES.UNKNOWN;

  // Network errors
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
    return ERROR_TYPES.NETWORK;
  }

  // HTTP status code based categorization
  if (error.response?.status) {
    const status = error.response.status;
    
    if (status >= 400 && status < 500) {
      if (status === 401) return ERROR_TYPES.AUTHENTICATION;
      if (status === 403) return ERROR_TYPES.PERMISSION;
      if (status === 422 || status === 400) return ERROR_TYPES.VALIDATION;
      return ERROR_TYPES.VALIDATION;
    }
    
    if (status >= 500) {
      return ERROR_TYPES.SERVER;
    }
  }

  // Connection refused, timeout, etc.
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    return ERROR_TYPES.NETWORK;
  }

  return ERROR_TYPES.UNKNOWN;
};

/**
 * Extracts a user-friendly error message from an error object
 * @param {Error} error - The error object
 * @param {string} operation - The operation that failed (optional)
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error, operation = null) => {
  if (!error) return ERROR_MESSAGES[ERROR_TYPES.UNKNOWN];

  // Try to get specific error message from API response
  let specificMessage = null;
  
  if (error.response?.data?.error?.message) {
    specificMessage = error.response.data.error.message;
  } else if (error.response?.data?.message) {
    specificMessage = error.response.data.message;
  } else if (error.message && !error.message.includes('Failed to')) {
    specificMessage = error.message;
  }

  // If we have a specific message and it's user-friendly, use it
  if (specificMessage && isUserFriendlyMessage(specificMessage)) {
    return specificMessage;
  }

  // Use operation-specific message if available
  if (operation && OPERATION_ERRORS[operation]) {
    return OPERATION_ERRORS[operation];
  }

  // Fall back to error type message
  const errorType = getErrorType(error);
  return ERROR_MESSAGES[errorType];
};

/**
 * Checks if a message is user-friendly (not technical)
 * @param {string} message - The message to check
 * @returns {boolean} True if the message is user-friendly
 */
const isUserFriendlyMessage = (message) => {
  const technicalTerms = [
    'undefined', 'null', 'NaN', 'TypeError', 'ReferenceError',
    'SyntaxError', 'fetch', 'XMLHttpRequest', 'Promise',
    'async', 'await', 'callback', 'stack trace'
  ];
  
  const lowerMessage = message.toLowerCase();
  return !technicalTerms.some(term => lowerMessage.includes(term.toLowerCase()));
};

/**
 * Logs error details for debugging while showing user-friendly message
 * @param {Error} error - The error object
 * @param {string} context - Context where the error occurred
 * @param {Object} additionalData - Additional data to log
 */
export const logError = (error, context, additionalData = {}) => {
  const errorInfo = {
    context,
    message: error.message,
    stack: error.stack,
    response: error.response?.data,
    status: error.response?.status,
    timestamp: new Date().toISOString(),
    ...additionalData
  };

  console.error(`[${context}] Error:`, errorInfo);
  
  // In production, you might want to send this to an error tracking service
  // Example: errorTrackingService.captureError(error, errorInfo);
};

/**
 * Creates a standardized error object for consistent handling
 * @param {Error} originalError - The original error
 * @param {string} operation - The operation that failed
 * @param {Object} context - Additional context
 * @returns {Object} Standardized error object
 */
export const createStandardError = (originalError, operation, context = {}) => {
  const errorType = getErrorType(originalError);
  const userMessage = getErrorMessage(originalError, operation);
  
  logError(originalError, operation, context);
  
  return {
    type: errorType,
    message: userMessage,
    originalError,
    operation,
    context,
    timestamp: new Date().toISOString()
  };
};

/**
 * Determines if an error is recoverable (user can retry)
 * @param {Error} error - The error object
 * @returns {boolean} True if the error is recoverable
 */
export const isRecoverableError = (error) => {
  const errorType = getErrorType(error);
  
  // Network and server errors are usually recoverable
  return [ERROR_TYPES.NETWORK, ERROR_TYPES.SERVER].includes(errorType);
};

/**
 * Gets retry delay based on error type (for exponential backoff)
 * @param {Error} error - The error object
 * @param {number} attemptNumber - Current attempt number
 * @returns {number} Delay in milliseconds
 */
export const getRetryDelay = (error, attemptNumber = 1) => {
  const errorType = getErrorType(error);
  
  if (!isRecoverableError(error)) {
    return 0; // Don't retry non-recoverable errors
  }
  
  // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
  const baseDelay = errorType === ERROR_TYPES.NETWORK ? 2000 : 1000;
  const delay = Math.min(baseDelay * Math.pow(2, attemptNumber - 1), 30000);
  
  return delay;
};