/**
 * Comprehensive debugging utilities for the Taskify application
 * Provides detailed logging, performance monitoring, and development tools
 */

// Debug configuration
const DEBUG_CONFIG = {
  enabled: import.meta.env.DEV || false,
  logLevel: import.meta.env.VITE_LOG_LEVEL || 'info', // 'debug', 'info', 'warn', 'error'
  enablePerformanceMonitoring: true,
  enableOperationTracking: true,
  enableStateLogging: true,
  maxLogEntries: 1000
};

// Log levels
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

// In-memory log storage for debugging
let debugLogs = [];
let performanceMetrics = new Map();
let operationTimings = new Map();

/**
 * Core logging function with level filtering
 * @param {string} level - Log level
 * @param {string} category - Log category
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 */
const log = (level, category, message, data = {}) => {
  if (!DEBUG_CONFIG.enabled) return;
  
  const currentLevel = LOG_LEVELS[level] || LOG_LEVELS.info;
  const configLevel = LOG_LEVELS[DEBUG_CONFIG.logLevel] || LOG_LEVELS.info;
  
  if (currentLevel < configLevel) return;
  
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    category,
    message,
    data,
    stack: level === 'error' ? new Error().stack : null
  };
  
  // Add to in-memory storage
  debugLogs.push(logEntry);
  
  // Limit log entries to prevent memory issues
  if (debugLogs.length > DEBUG_CONFIG.maxLogEntries) {
    debugLogs = debugLogs.slice(-DEBUG_CONFIG.maxLogEntries);
  }
  
  // Console output with appropriate styling
  const emoji = {
    debug: '🔍',
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌'
  }[level] || 'ℹ️';
  
  const style = {
    debug: 'color: #888',
    info: 'color: #0066cc',
    warn: 'color: #ff8800',
    error: 'color: #cc0000; font-weight: bold'
  }[level] || 'color: #0066cc';
  
  console.log(
    `%c${emoji} [${category}] ${message}`,
    style,
    data
  );
};

/**
 * Debug logger with different levels
 */
export const debugLogger = {
  debug: (category, message, data) => log('debug', category, message, data),
  info: (category, message, data) => log('info', category, message, data),
  warn: (category, message, data) => log('warn', category, message, data),
  error: (category, message, data) => log('error', category, message, data)
};

/**
 * Operation timing and performance monitoring
 */
export const performanceMonitor = {
  /**
   * Start timing an operation
   * @param {string} operationId - Unique operation identifier
   * @param {Object} context - Operation context
   */
  startOperation: (operationId, context = {}) => {
    if (!DEBUG_CONFIG.enablePerformanceMonitoring) return;
    
    const startTime = performance.now();
    operationTimings.set(operationId, {
      startTime,
      context,
      status: 'running'
    });
    
    debugLogger.debug('PERFORMANCE', `Started operation: ${operationId}`, context);
  },
  
  /**
   * End timing an operation
   * @param {string} operationId - Operation identifier
   * @param {Object} result - Operation result
   */
  endOperation: (operationId, result = {}) => {
    if (!DEBUG_CONFIG.enablePerformanceMonitoring) return;
    
    const timing = operationTimings.get(operationId);
    if (!timing) {
      debugLogger.warn('PERFORMANCE', `No timing found for operation: ${operationId}`);
      return;
    }
    
    const endTime = performance.now();
    const duration = endTime - timing.startTime;
    
    const completedTiming = {
      ...timing,
      endTime,
      duration,
      status: 'completed',
      result
    };
    
    operationTimings.set(operationId, completedTiming);
    
    // Store in performance metrics
    const category = timing.context.category || 'unknown';
    if (!performanceMetrics.has(category)) {
      performanceMetrics.set(category, []);
    }
    performanceMetrics.get(category).push(completedTiming);
    
    // Log performance
    const level = duration > 5000 ? 'warn' : duration > 2000 ? 'info' : 'debug';
    debugLogger[level]('PERFORMANCE', `Completed operation: ${operationId} (${duration.toFixed(2)}ms)`, {
      duration,
      context: timing.context,
      result
    });
  },
  
  /**
   * Mark an operation as failed
   * @param {string} operationId - Operation identifier
   * @param {Error} error - Error that occurred
   */
  failOperation: (operationId, error) => {
    if (!DEBUG_CONFIG.enablePerformanceMonitoring) return;
    
    const timing = operationTimings.get(operationId);
    if (!timing) return;
    
    const endTime = performance.now();
    const duration = endTime - timing.startTime;
    
    const failedTiming = {
      ...timing,
      endTime,
      duration,
      status: 'failed',
      error: {
        message: error.message,
        stack: error.stack,
        type: error.constructor.name
      }
    };
    
    operationTimings.set(operationId, failedTiming);
    
    debugLogger.error('PERFORMANCE', `Failed operation: ${operationId} (${duration.toFixed(2)}ms)`, {
      duration,
      context: timing.context,
      error: failedTiming.error
    });
  },
  
  /**
   * Get performance metrics summary
   * @returns {Object} Performance summary
   */
  getMetrics: () => {
    const summary = {};
    
    performanceMetrics.forEach((timings, category) => {
      const durations = timings.map(t => t.duration);
      const successful = timings.filter(t => t.status === 'completed').length;
      const failed = timings.filter(t => t.status === 'failed').length;
      
      summary[category] = {
        total: timings.length,
        successful,
        failed,
        averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
        minDuration: Math.min(...durations),
        maxDuration: Math.max(...durations),
        successRate: (successful / timings.length) * 100
      };
    });
    
    return summary;
  }
};

/**
 * Operation state debugging
 */
export const operationDebugger = {
  /**
   * Log operation state change
   * @param {string} operation - Operation type
   * @param {string} action - Action being performed
   * @param {Object} state - Current state
   * @param {Object} context - Additional context
   */
  logStateChange: (operation, action, state, context = {}) => {
    if (!DEBUG_CONFIG.enableOperationTracking) return;
    
    debugLogger.debug('OPERATION', `${operation}: ${action}`, {
      state,
      context,
      timestamp: Date.now()
    });
  },
  
  /**
   * Log operation blocking
   * @param {string} operation - Operation type
   * @param {string} reason - Reason for blocking
   * @param {Object} context - Additional context
   */
  logBlocked: (operation, reason, context = {}) => {
    debugLogger.warn('OPERATION', `${operation} blocked: ${reason}`, context);
  },
  
  /**
   * Log operation success
   * @param {string} operation - Operation type
   * @param {Object} result - Operation result
   * @param {Object} context - Additional context
   */
  logSuccess: (operation, result, context = {}) => {
    debugLogger.info('OPERATION', `${operation} succeeded`, { result, context });
  },
  
  /**
   * Log operation failure
   * @param {string} operation - Operation type
   * @param {Error} error - Error that occurred
   * @param {Object} context - Additional context
   */
  logFailure: (operation, error, context = {}) => {
    debugLogger.error('OPERATION', `${operation} failed: ${error.message}`, {
      error: {
        message: error.message,
        stack: error.stack,
        type: error.constructor.name
      },
      context
    });
  }
};

/**
 * Component state debugging
 */
export const stateDebugger = {
  /**
   * Log component state change
   * @param {string} component - Component name
   * @param {string} stateKey - State key that changed
   * @param {*} oldValue - Previous value
   * @param {*} newValue - New value
   */
  logStateChange: (component, stateKey, oldValue, newValue) => {
    if (!DEBUG_CONFIG.enableStateLogging) return;
    
    debugLogger.debug('STATE', `${component}.${stateKey} changed`, {
      oldValue,
      newValue,
      timestamp: Date.now()
    });
  },
  
  /**
   * Log component mount
   * @param {string} component - Component name
   * @param {Object} props - Component props
   */
  logMount: (component, props = {}) => {
    debugLogger.debug('LIFECYCLE', `${component} mounted`, { props });
  },
  
  /**
   * Log component unmount
   * @param {string} component - Component name
   */
  logUnmount: (component) => {
    debugLogger.debug('LIFECYCLE', `${component} unmounted`);
  }
};

/**
 * Development utilities
 */
export const devUtils = {
  /**
   * Get all debug logs
   * @returns {Array} Array of log entries
   */
  getLogs: () => [...debugLogs],
  
  /**
   * Clear all debug logs
   */
  clearLogs: () => {
    debugLogs = [];
    debugLogger.info('DEBUG', 'Debug logs cleared');
  },
  
  /**
   * Export logs as JSON
   * @returns {string} JSON string of logs
   */
  exportLogs: () => {
    return JSON.stringify({
      logs: debugLogs,
      performanceMetrics: Object.fromEntries(performanceMetrics),
      operationTimings: Object.fromEntries(operationTimings),
      exportedAt: new Date().toISOString()
    }, null, 2);
  },
  
  /**
   * Get current debug configuration
   * @returns {Object} Debug configuration
   */
  getConfig: () => ({ ...DEBUG_CONFIG }),
  
  /**
   * Update debug configuration
   * @param {Object} newConfig - New configuration values
   */
  updateConfig: (newConfig) => {
    Object.assign(DEBUG_CONFIG, newConfig);
    debugLogger.info('DEBUG', 'Debug configuration updated', newConfig);
  },
  
  /**
   * Get system information for debugging
   * @returns {Object} System information
   */
  getSystemInfo: () => {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      },
      window: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      },
      memory: performance.memory ? {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      } : null,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Global error handler for debugging
 */
export const setupGlobalErrorHandling = () => {
  if (!DEBUG_CONFIG.enabled) return;
  
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    debugLogger.error('GLOBAL', 'Unhandled promise rejection', {
      reason: event.reason,
      promise: event.promise
    });
  });
  
  // Handle global errors
  window.addEventListener('error', (event) => {
    debugLogger.error('GLOBAL', 'Global error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
  });
  
  debugLogger.info('DEBUG', 'Global error handling setup complete');
};

// Initialize global error handling
if (typeof window !== 'undefined') {
  setupGlobalErrorHandling();
}

// Export debug utilities to window for console access in development
if (DEBUG_CONFIG.enabled && typeof window !== 'undefined') {
  window.taskifyDebug = {
    logger: debugLogger,
    performance: performanceMonitor,
    operations: operationDebugger,
    state: stateDebugger,
    utils: devUtils
  };
  
  debugLogger.info('DEBUG', 'Debug utilities available at window.taskifyDebug');
}