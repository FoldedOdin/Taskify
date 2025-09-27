/**
 * Operation State Manager - Provides robust state management for async operations
 * with timeout mechanisms, duplicate prevention, and automatic cleanup
 */

// Default timeout values for different operations (in milliseconds)
const DEFAULT_TIMEOUTS = {
  creating: 15000,    // 15 seconds for create operations
  updating: 10000,    // 10 seconds for update operations
  deleting: 10000,    // 10 seconds for delete operations
  toggling: 8000,     // 8 seconds for toggle operations
  reordering: 12000,  // 12 seconds for reorder operations
  searching: 5000     // 5 seconds for search operations
};

// Maximum number of simultaneous operations per type
const MAX_CONCURRENT_OPERATIONS = {
  creating: 1,        // Only one create at a time
  updating: 5,        // Up to 5 updates simultaneously
  deleting: 5,        // Up to 5 deletes simultaneously
  toggling: 10,       // Up to 10 toggles simultaneously
  reordering: 1,      // Only one reorder at a time
  searching: 1        // Only one search at a time
};

/**
 * Creates an operation state manager with timeout and concurrency controls
 * @param {Function} setOperationLoading - State setter function
 * @param {Object} options - Configuration options
 * @returns {Object} Operation state manager
 */
export const createOperationStateManager = (setOperationLoading, options = {}) => {
  const timeouts = { ...DEFAULT_TIMEOUTS, ...options.timeouts };
  const maxConcurrent = { ...MAX_CONCURRENT_OPERATIONS, ...options.maxConcurrent };
  
  // Track active timeouts for cleanup
  const activeTimeouts = new Map();
  
  // Track operation start times for performance monitoring
  const operationStartTimes = new Map();
  
  /**
   * Sets operation loading state with timeout protection
   * @param {string} operation - Operation type
   * @param {boolean} value - Loading state value
   * @param {string|null} id - Optional item ID for item-specific operations
   * @param {number|null} customTimeout - Custom timeout override
   */
  const setOperationLoadingWithTimeout = (operation, value, id = null, customTimeout = null) => {
    const timeoutMs = customTimeout || timeouts[operation] || DEFAULT_TIMEOUTS.creating;
    const operationKey = id ? `${operation}-${id}` : operation;
    
    console.log(`🔄 Setting operation loading state:`, { 
      operation, 
      value, 
      id, 
      timeout: timeoutMs,
      operationKey 
    });
    
    // Clear any existing timeout for this operation
    if (activeTimeouts.has(operationKey)) {
      clearTimeout(activeTimeouts.get(operationKey));
      activeTimeouts.delete(operationKey);
    }
    
    // Set the loading state
    setOperationLoading(prev => {
      if (id && (operation === 'updating' || operation === 'deleting' || operation === 'toggling')) {
        const newSet = new Set(prev[operation]);
        if (value) {
          newSet.add(id);
          console.log(`➕ Added to loading set:`, { operation, id, setSize: newSet.size });
        } else {
          newSet.delete(id);
          console.log(`➖ Removed from loading set:`, { operation, id, setSize: newSet.size });
        }
        return { ...prev, [operation]: newSet };
      } else {
        return { ...prev, [operation]: value };
      }
    });
    
    // Track operation start time for performance monitoring
    if (value) {
      operationStartTimes.set(operationKey, Date.now());
    } else {
      // Log operation duration when completed
      const startTime = operationStartTimes.get(operationKey);
      if (startTime) {
        const duration = Date.now() - startTime;
        console.log(`⏱️ Operation completed:`, { operation, id, duration: `${duration}ms` });
        operationStartTimes.delete(operationKey);
      }
    }
    
    // Set timeout to clear loading state if it gets stuck
    if (value && timeoutMs > 0) {
      const timeoutId = setTimeout(() => {
        console.warn(`⏰ Timeout clearing stuck loading state:`, { operation, id, timeout: timeoutMs });
        
        // Clear the loading state
        setOperationLoading(prev => {
          if (id && (operation === 'updating' || operation === 'deleting' || operation === 'toggling')) {
            const newSet = new Set(prev[operation]);
            newSet.delete(id);
            console.log(`🧹 Timeout cleanup - removed from loading set:`, { operation, id });
            return { ...prev, [operation]: newSet };
          } else {
            console.log(`🧹 Timeout cleanup - cleared loading state:`, { operation });
            return { ...prev, [operation]: false };
          }
        });
        
        // Clean up tracking
        activeTimeouts.delete(operationKey);
        operationStartTimes.delete(operationKey);
      }, timeoutMs);
      
      activeTimeouts.set(operationKey, timeoutId);
    }
  };
  
  /**
   * Checks if an operation is currently loading
   * @param {string} operation - Operation type
   * @param {string|null} id - Optional item ID
   * @param {Object} operationLoading - Current loading state
   * @returns {boolean} True if operation is loading
   */
  const isOperationLoading = (operation, id = null, operationLoading) => {
    if (id && (operation === 'updating' || operation === 'deleting' || operation === 'toggling')) {
      const operationSet = operationLoading[operation];
      const isLoading = (operationSet && operationSet instanceof Set) ? operationSet.has(id) : false;
      
      console.log(`🔍 Checking operation loading (with ID):`, { 
        operation, 
        id, 
        operationSet: operationSet ? `Set(${operationSet.size})` : 'null/undefined',
        isLoading 
      });
      
      return isLoading;
    } else {
      const isLoading = operationLoading[operation] || false;
      
      console.log(`🔍 Checking operation loading (no ID):`, { operation, isLoading });
      return isLoading;
    }
  };
  
  /**
   * Checks if operation can proceed based on concurrency limits
   * @param {string} operation - Operation type
   * @param {Object} operationLoading - Current loading state
   * @returns {boolean} True if operation can proceed
   */
  const canProceedWithOperation = (operation, operationLoading) => {
    const maxAllowed = maxConcurrent[operation] || 1;
    
    if (operation === 'updating' || operation === 'deleting' || operation === 'toggling') {
      const operationSet = operationLoading[operation];
      const currentCount = (operationSet && operationSet instanceof Set) ? operationSet.size : 0;
      const canProceed = currentCount < maxAllowed;
      
      console.log(`🚦 Concurrency check:`, { 
        operation, 
        operationSet: operationSet ? `Set(${operationSet.size})` : 'null/undefined',
        currentCount, 
        maxAllowed, 
        canProceed 
      });
      
      return canProceed;
    } else {
      const isCurrentlyLoading = operationLoading[operation] || false;
      const canProceed = !isCurrentlyLoading;
      
      console.log(`🚦 Single operation check:`, { 
        operation, 
        isCurrentlyLoading, 
        canProceed 
      });
      
      return canProceed;
    }
  };
  
  /**
   * Resets all loading states (useful on component mount)
   */
  const resetAllLoadingStates = () => {
    console.log(`🔄 Resetting all loading states`);
    
    // Clear all active timeouts
    activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    activeTimeouts.clear();
    
    // Clear operation tracking
    operationStartTimes.clear();
    
    // Reset loading states
    setOperationLoading({
      creating: false,
      updating: new Set(),
      deleting: new Set(),
      toggling: new Set(),
      reordering: false,
      searching: false
    });
  };
  
  /**
   * Cleans up resources when component unmounts
   */
  const cleanup = () => {
    console.log(`🧹 Cleaning up operation state manager`);
    
    // Clear all active timeouts
    activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    activeTimeouts.clear();
    
    // Clear operation tracking
    operationStartTimes.clear();
  };
  
  /**
   * Gets performance metrics for operations
   * @returns {Object} Performance metrics
   */
  const getPerformanceMetrics = () => {
    const currentTime = Date.now();
    const activeOperations = [];
    
    operationStartTimes.forEach((startTime, operationKey) => {
      const duration = currentTime - startTime;
      activeOperations.push({
        operation: operationKey,
        duration,
        isStuck: duration > (timeouts[operationKey.split('-')[0]] || DEFAULT_TIMEOUTS.creating)
      });
    });
    
    return {
      activeOperations,
      activeTimeouts: activeTimeouts.size,
      totalActiveOperations: operationStartTimes.size
    };
  };
  
  return {
    setOperationLoadingWithTimeout,
    isOperationLoading,
    canProceedWithOperation,
    resetAllLoadingStates,
    cleanup,
    getPerformanceMetrics
  };
};

/**
 * Hook for using operation state manager in React components
 * @param {Function} setOperationLoading - State setter function
 * @param {Object} options - Configuration options
 * @returns {Object} Operation state manager
 */
export const useOperationStateManager = (setOperationLoading, options = {}) => {
  const manager = createOperationStateManager(setOperationLoading, options);
  
  // Cleanup on unmount
  React.useEffect(() => {
    return manager.cleanup;
  }, [manager]);
  
  return manager;
};