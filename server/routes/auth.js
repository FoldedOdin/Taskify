import express from 'express';
import User from '../models/User.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Input validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Username, email, and password are required',
          code: 'MISSING_FIELDS'
        }
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Password must be at least 6 characters long',
          code: 'INVALID_PASSWORD'
        }
      });
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please enter a valid email address',
          code: 'INVALID_EMAIL'
        }
      });
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username) || username.length < 3 || username.length > 30) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Username must be 3-30 characters long and contain only letters, numbers, and underscores',
          code: 'INVALID_USERNAME'
        }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username }
      ]
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'email' : 'username';
      return res.status(409).json({
        success: false,
        error: {
          message: `A user with this ${field} already exists`,
          code: 'USER_EXISTS',
          field
        }
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create new user
    const user = new User({
      username,
      email: email.toLowerCase(),
      passwordHash
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    // Return success response
    res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        token
      },
      message: 'User registered successfully'
    });

  } catch (error) {
    console.error('Registration error:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errors
        }
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        error: {
          message: `A user with this ${field} already exists`,
          code: 'DUPLICATE_KEY',
          field
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error during registration',
        code: 'REGISTRATION_ERROR'
      }
    });
  }
});

/**
 * @route   GET /auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // This route will use the authentication middleware
    const user = await User.findById(req.userId).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get user profile',
        code: 'PROFILE_ERROR'
      }
    });
  }
});

/**
 * @route   POST /auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Input validation
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email/username and password are required',
          code: 'MISSING_CREDENTIALS'
        }
      });
    }

    // Find user by email or username
    const user = await User.findByCredentials(identifier);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return success response
    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        token
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);

    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error during login',
        code: 'LOGIN_ERROR'
      }
    });
  }
});

/**
 * @route   POST /auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Since we're using stateless JWT tokens, logout is handled client-side
    // This endpoint confirms the user was authenticated and can clear client state
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Logout failed',
        code: 'LOGOUT_ERROR'
      }
    });
  }
});

export default router;