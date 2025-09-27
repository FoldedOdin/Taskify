import React from 'react';

/**
 * Reusable loading spinner component with different sizes and variants
 */
const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'primary', 
  className = '',
  text = null 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-8 w-8';
      case 'xl':
        return 'h-12 w-12';
      default: // md
        return 'h-6 w-6';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'text-gray-400 dark:text-gray-500';
      case 'white':
        return 'text-white';
      default: // primary
        return 'text-blue-500 dark:text-blue-400';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'lg':
        return 'text-base';
      case 'xl':
        return 'text-lg';
      default: // md
        return 'text-sm';
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <svg
          className={`animate-spin ${getSizeClasses()} ${getVariantClasses()}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {text && (
          <span className={`${getTextSize()} ${getVariantClasses()} font-medium`}>
            {text}
          </span>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;