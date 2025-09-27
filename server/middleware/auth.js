import { verifyToken, extractTokenFromHeader } from '../utils/auth.js';
import User from '../models/User.js';

/**
 * Authentication middleware to verify JWT tokens
 * Protects routes by ensuring user is authenticated
 */
export const authenticateToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Access token is required',
          code: 'MISSING_TOKEN'
        }
      });
    }

    // Verify the token
    const decoded = verifyToken(token);

    // Find the user in the database to ensure they still exist
    const user = await User.findById(decoded.id).select('-passwordHash');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    // Add user information to request object
    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    console.error('Authentication error:', error);

    // Handle specific JWT errors
    if (error.message === 'Token has expired') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token has expired',
          code: 'TOKEN_EXPIRED'
        }
      });
    }

    if (error.message === 'Invalid token') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid token',
          code: 'INVALID_TOKEN'
        }
      });
    }

    // Generic authentication error
    return res.status(401).json({
      success: false,
      error: {
        message: 'Authentication failed',
        code: 'AUTH_FAILED'
      }
    });
  }
};

/**
 * Optional authentication middleware
 * Adds user info to request if token is present, but doesn't require it
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-passwordHash');
      
      if (user) {
        req.user = user;
        req.userId = user._id;
      }
    }

    next();
  } catch (error) {
    // For optional auth, we don't return errors, just continue without user
    console.warn('Optional authentication failed:', error.message);
    next();
  }
};

/**
 * Middleware to check if user owns a resource
 * Should be used after authenticateToken middleware
 */
export const requireOwnership = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        }
      });
    }

    // This middleware will be used in route handlers where we check resource ownership
    // The actual ownership check will be done in the route handler
    next();
  };
};

export default {
  authenticateToken,
  optionalAuth,
  requireOwnership
};