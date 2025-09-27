import React, { useEffect, useRef } from 'react';

/**
 * A wrapper component that helps with React 19 StrictMode compatibility
 * for drag and drop operations. React 19's StrictMode can cause issues
 * with drag and drop libraries due to double-rendering in development.
 */
const StrictModeCompatibleDragDrop = ({ children, onMount, onUnmount }) => {
  const mountedRef = useRef(false);
  const cleanupRef = useRef(null);

  useEffect(() => {
    // In React 19 StrictMode, effects run twice in development
    // We use a ref to ensure our setup only runs once
    if (!mountedRef.current) {
      mountedRef.current = true;
      
      if (onMount) {
        cleanupRef.current = onMount();
      }
    }

    return () => {
      // Only run cleanup if we actually mounted
      if (mountedRef.current && cleanupRef.current) {
        if (typeof cleanupRef.current === 'function') {
          cleanupRef.current();
        }
        if (onUnmount) {
          onUnmount();
        }
      }
    };
  }, [onMount, onUnmount]);

  return children;
};

export default StrictModeCompatibleDragDrop;