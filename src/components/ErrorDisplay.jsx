import React, { useState } from 'react';
import { isRecoverableError, getErrorType, getErrorMessage } from '../utils/errorHandler';

/**
 * Enhanced error display component with different styles, retry mechanisms, and detailed feedback
 */
const ErrorDisplay = ({ 
  error, 
  onDismiss, 
  onRetry, 
  className = '',
  variant = 'auto', // 'error', 'warning', 'info', 'auto'
  operation = null,
  showDetails = false,
  autoRetryAttempts = 0,
  maxAutoRetries = 3,
  onAutoRetry = null
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  if (!error) return null;

  // Auto-determine variant based on error type if variant is 'auto'
  const errorType = typeof error === 'object' ? getErrorType(error) : 'unknown';
  const actualVariant = variant === 'auto' ? (
    errorType === 'network' ? 'warning' :
    errorType === 'validation' ? 'info' :
    'error'
  ) : variant;

  const getVariantStyles = () => {
    switch (actualVariant) {
      case 'warning':
        return {
          container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700',
          text: 'text-yellow-800 dark:text-yellow-200',
          icon: 'text-yellow-400',
          button: 'text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200'
        };
      case 'info':
        return {
          container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700',
          text: 'text-blue-800 dark:text-blue-200',
          icon: 'text-blue-400',
          button: 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200'
        };
      default: // error
        return {
          container: 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700',
          text: 'text-red-800 dark:text-red-200',
          icon: 'text-red-400',
          button: 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200'
        };
    }
  };

  const styles = getVariantStyles();
  const errorMessage = typeof error === 'string' ? error : getErrorMessage(error, operation);
  const canRetry = onRetry && (typeof error === 'object' ? isRecoverableError(error) : true);
  const canAutoRetry = onAutoRetry && autoRetryAttempts < maxAutoRetries && canRetry;

  const handleRetry = async () => {
    if (!onRetry || isRetrying) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } catch (retryError) {
      console.error('Manual retry failed:', retryError);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleAutoRetry = async () => {
    if (!onAutoRetry || isRetrying) return;
    
    setIsRetrying(true);
    try {
      await onAutoRetry();
    } catch (retryError) {
      console.error('Auto retry failed:', retryError);
    } finally {
      setIsRetrying(false);
    }
  };

  // Get recovery suggestions based on error type
  const getRecoverySuggestion = () => {
    switch (errorType) {
      case 'network':
        return '💡 Check your internet connection and try again';
      case 'server':
        return '💡 The server may be temporarily unavailable. Please try again in a moment';
      case 'validation':
        return '💡 Please check your input and try again';
      case 'authentication':
        return '💡 Please refresh the page and try again';
      default:
        return null;
    }
  };

  const getIcon = () => {
    // Use error type for more specific icons
    if (errorType === 'network') {
      return (
        <svg className={`h-5 w-5 ${styles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    }

    switch (actualVariant) {
      case 'warning':
        return (
          <svg className={`h-5 w-5 ${styles.icon}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg className={`h-5 w-5 ${styles.icon}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default: // error
        return (
          <svg className={`h-5 w-5 ${styles.icon}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const recoverySuggestion = getRecoverySuggestion();

  return (
    <div className={`p-4 border rounded-md ${styles.container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium ${styles.text}`}>
              {errorMessage}
            </p>
            {operation && (
              <span className={`text-xs opacity-75 ml-2 ${styles.text}`}>
                Operation: {operation}
              </span>
            )}
          </div>
          
          {/* Auto-retry information */}
          {autoRetryAttempts > 0 && (
            <p className={`text-xs mt-1 opacity-75 ${styles.text}`}>
              {canAutoRetry ? `Auto-retry attempt ${autoRetryAttempts} of ${maxAutoRetries}` : 
               `Failed after ${autoRetryAttempts} auto-retry attempts`}
            </p>
          )}
          
          {/* Recovery suggestion */}
          {recoverySuggestion && (
            <p className={`text-xs mt-2 opacity-75 ${styles.text}`}>
              {recoverySuggestion}
            </p>
          )}
          
          {/* Error details toggle */}
          {showDetails && error.stack && (
            <div className="mt-2">
              <button
                onClick={() => setShowErrorDetails(!showErrorDetails)}
                className={`text-xs underline opacity-75 hover:opacity-100 ${styles.button}`}
              >
                {showErrorDetails ? 'Hide' : 'Show'} technical details
              </button>
              {showErrorDetails && (
                <pre className="text-xs mt-2 p-2 bg-black/10 dark:bg-white/10 rounded overflow-auto max-h-32">
                  {error.stack}
                </pre>
              )}
            </div>
          )}
          
          {/* Action buttons */}
          <div className="mt-3 flex items-center space-x-3">
            {canRetry && (
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className={`text-sm ${styles.button} underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isRetrying ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Retrying...
                  </span>
                ) : (
                  'Try Again'
                )}
              </button>
            )}
            
            {canAutoRetry && (
              <button
                onClick={handleAutoRetry}
                disabled={isRetrying}
                className={`text-sm ${styles.button} underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Auto Retry
              </button>
            )}
          </div>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={onDismiss}
                className={`inline-flex rounded-md p-1.5 ${styles.button} hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current`}
                aria-label="Dismiss"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;