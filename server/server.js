import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import todoRoutes from './routes/todos.js';
import authRoutes from './routes/auth.js';
import { 
  validateEnvironment, 
  createRateLimiter, 
  createCorsConfig, 
  helmetConfig, 
  securityHeaders 
} from './config/security.js';

// Load environment variables first
dotenv.config();

// Validate environment variables before starting
validateEnvironment();

// Connect to MongoDB (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();
const PORT = process.env.PORT || 3001;

// Security Middleware (apply early)
app.use(helmet(helmetConfig));
app.use(securityHeaders);

// Rate limiting (apply before other middleware)
if (process.env.NODE_ENV === 'production') {
  app.use(createRateLimiter());
}

// CORS configuration
app.use(cors(createCorsConfig()));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      message: 'Something went wrong!',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      path: req.originalUrl
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});

export default app;