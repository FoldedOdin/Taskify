import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import todoRoutes from './routes/todos.js';
import authRoutes from './routes/auth.js';
import logger from './utils/logger.js';
import { 
  validateEnvironment, 
  createRateLimiter, 
  createCorsConfig, 
  helmetConfig, 
  securityHeaders 
} from './config/security.js';

// Load environment variables first
dotenv.config();

// Initialize server
async function initializeServer() {
  try {
    // Validate environment variables before starting
    validateEnvironment();
    logger.info('Environment validation successful');

    // Connect to MongoDB (skip in test environment)
    if (process.env.NODE_ENV !== 'test') {
      await connectDB();
      logger.info('Database connection established');
    }
  } catch (error) {
    logger.error('Server initialization failed', { error: error.message });
    process.exit(1);
  }
}

const app = express();
const trustProxy = process.env.TRUST_PROXY || (process.env.NODE_ENV === 'production' ? '1' : 'true');
app.set('trust proxy', trustProxy);

// Security Middleware (apply early)
app.use(helmet(helmetConfig));
app.use(securityHeaders);

// Request logging (apply early)
if (process.env.NODE_ENV === 'production') {
  app.use(logger.requestLogger());
}

// Rate limiting (apply before other middleware)
if (process.env.NODE_ENV === 'production') {
  app.use(createRateLimiter());
}

// CORS configuration
app.use(cors(createCorsConfig()));

// Body parsing with limits
const bodyLimit = process.env.BODY_LIMIT || '10mb';
app.use(express.json({ limit: bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: bodyLimit }));

// Request timeout middleware
app.use((req, res, next) => {
  const timeout = parseInt(process.env.REQUEST_TIMEOUT) || 30000;
  req.setTimeout(timeout, () => {
    logger.warn('Request timeout', { 
      method: req.method, 
      url: req.url,
      timeout: `${timeout}ms`
    });
    res.status(408).json({
      success: false,
      error: {
        message: 'Request timeout',
        code: 'REQUEST_TIMEOUT'
      }
    });
  });
  next();
});

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Taskify API Server is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/todos', todoRoutes);
app.use('/api/auth', authRoutes);

// Error logging middleware
app.use(logger.errorLogger());

// Error handling middleware
app.use((err, req, res, next) => {
  // Don't log 404 errors as they're handled separately
  if (err.status !== 404) {
    logger.error('Unhandled error', {
      error: err.message,
      stack: err.stack,
      method: req.method,
      url: req.url
    });
  }

  // Determine error status
  const status = err.status || err.statusCode || 500;
  
  // Create error response
  const errorResponse = {
    success: false,
    error: {
      message: status === 500 ? 'Internal server error' : err.message,
      code: err.code || 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err.stack,
        details: err.details 
      })
    }
  };

  res.status(status).json(errorResponse);
});

// 404 handler
app.use((req, res) => {
  logger.warn('Route not found', { 
    method: req.method, 
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress
  });
  
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'ROUTE_NOT_FOUND',
      path: req.originalUrl
    }
  });
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close((err) => {
    if (err) {
      logger.error('Error during server shutdown', { error: err.message });
      process.exit(1);
    }
    
    logger.info('Server closed successfully');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection', { 
    reason: reason?.message || reason,
    stack: reason?.stack
  });
  process.exit(1);
});

// Start server after initialization
let server;

initializeServer().then(() => {
  server = app.listen(PORT, () => {
    logger.info('Server started successfully', {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      corsOrigin: process.env.CLIENT_URL || 'http://localhost:5173'
    });
    
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS enabled for: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  });
}).catch((error) => {
  logger.error('Failed to start server', { error: error.message });
  process.exit(1);
});

export default app;