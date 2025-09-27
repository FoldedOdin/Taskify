import React from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * Button component with loading state support
 */
const LoadingButton = ({
  children,
  loading = false,
  disabled = false,
  loadingText = null,
  className = '',
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-500';
      case 'danger':
        return 'bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-700 focus:ring-red-500';
      case 'success':
        return 'bg-green-500 dark:bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-700 focus:ring-green-500';
      default: // primary
        return 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700 focus:ring-blue-500';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default: // md
        return 'px-4 py-2 text-base';
    }
  };

  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center
        ${getSizeClasses()}
        ${getVariantClasses()}
        rounded-lg
        font-medium
        focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800
        transition-colors duration-200
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {loading && (
        <LoadingSpinner
          size="sm"
          variant="white"
          className="mr-2"
        />
      )}
      {loading && loadingText ? loadingText : children}
    </button>
  );
};

export default LoadingButton;