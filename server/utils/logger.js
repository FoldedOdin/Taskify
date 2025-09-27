/**
 * Production-ready logging utility
 */

import fs from 'fs';
import path from 'path';

// Log levels
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

class Logger {
  constructor() {
    this.logLevel = LOG_LEVELS[process.env.LOG_LEVEL] || LOG_LEVELS.info;
    this.logFile = process.env.LOG_FILE;
    
    // Create logs directory if it doesn't exist
    if (this.logFile) {
      const logDir = path.dirname(this.logFile);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    }
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    };

    return JSON.stringify(logEntry);
  }

  writeToFile(formattedMessage) {
    if (this.logFile) {
      try {
        fs.appendFileSync(this.logFile, formattedMessage + '\n');
      } catch (error) {
        console.error('Failed to write to log file:', error);
      }
    }
  }

  log(level, message, meta = {}) {
    if (LOG_LEVELS[level] > this.logLevel) {
      return; // Skip if log level is too high
    }

    const formattedMessage = this.formatMessage(level, message, meta);
    
    // Always log to console in development
    if (process.env.NODE_ENV === 'development') {
      const consoleMethod = level === 'error' ? 'error' : 
                           level === 'warn' ? 'warn' : 'log';
      console[consoleMethod](`[${level.toUpperCase()}]`, message, meta);
    }
    
    // Write to file in production
    if (process.env.NODE_ENV === 'production') {
      this.writeToFile(formattedMessage);
    }
  }

  error(message, meta = {}) {
    this.log('error', message, meta);
  }

  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }

  // Request logging middleware
  requestLogger() {
    return (req, res, next) => {
      const start = Date.now();
      
      // Log request
      this.info('Incoming request', {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress
      });

      // Override res.end to log response
      const originalEnd = res.end;
      res.end = function(...args) {
        const duration = Date.now() - start;
        
        logger.info('Request completed', {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration: `${duration}ms`
        });

        originalEnd.apply(this, args);
      };

      next();
    };
  }

  // Error logging middleware
  errorLogger() {
    return (err, req, res, next) => {
      this.error('Request error', {
        error: err.message,
        stack: err.stack,
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress
      });

      next(err);
    };
  }
}

// Create singleton instance
const logger = new Logger();

export default logger;