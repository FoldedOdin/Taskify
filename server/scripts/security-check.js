#!/usr/bin/env node

/**
 * Security Check Script
 * Validates security configuration before deployment
 */

import dotenv from 'dotenv';
import { validateEnvironment } from '../config/security.js';

dotenv.config();

const securityChecks = {
  // Check JWT secret strength
  checkJWTSecret: () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return { pass: false, message: 'JWT_SECRET is not set' };
    }
    if (secret.length < 32) {
      return { pass: false, message: 'JWT_SECRET is too short (minimum 32 characters)' };
    }
    if (secret.includes('your-super-secret') || secret.includes('change-in-production')) {
      return { pass: false, message: 'JWT_SECRET appears to be a default/example value' };
    }
    return { pass: true, message: 'JWT_SECRET is properly configured' };
  },

  // Check MongoDB URI security
  checkMongoURI: () => {
    const uri = process.env.MONGODB_URI;
    const isDevelopmentCheck = process.argv.includes('--dev');
    
    if (!uri) {
      return { pass: false, message: 'MONGODB_URI is not set' };
    }
    
    if (uri.includes('Newbie:vmYTyMxgXRIzfogm')) {
      if (isDevelopmentCheck) {
        return { pass: true, message: 'MONGODB_URI contains development credentials (development mode)' };
      }
      return { pass: false, message: 'MONGODB_URI contains example/development credentials' };
    }
    
    if (!uri.startsWith('mongodb+srv://') && !uri.startsWith('mongodb://')) {
      return { pass: false, message: 'MONGODB_URI format is invalid' };
    }
    
    return { pass: true, message: 'MONGODB_URI is properly configured' };
  },

  // Check NODE_ENV
  checkNodeEnv: () => {
    const env = process.env.NODE_ENV;
    const isDevelopmentCheck = process.argv.includes('--dev');
    
    if (env === 'production') {
      return { pass: true, message: 'NODE_ENV is set to production' };
    }
    
    if (isDevelopmentCheck) {
      return { pass: true, message: `NODE_ENV is '${env}' (development mode check)` };
    }
    
    return { pass: false, message: `NODE_ENV is '${env}', should be 'production' for production deployment` };
  },

  // Check HTTPS configuration
  checkHTTPS: () => {
    const clientUrl = process.env.CLIENT_URL;
    if (!clientUrl) {
      return { pass: false, message: 'CLIENT_URL is not set' };
    }
    if (process.env.NODE_ENV === 'production' && !clientUrl.startsWith('https://')) {
      return { pass: false, message: 'CLIENT_URL should use HTTPS in production' };
    }
    return { pass: true, message: 'HTTPS configuration is correct' };
  },

  // Check for development/debug settings
  checkDebugSettings: () => {
    const issues = [];
    
    if (process.env.DEBUG) {
      issues.push('DEBUG environment variable is set');
    }
    
    if (process.env.NODE_ENV === 'production') {
      if (process.env.CLIENT_URL && process.env.CLIENT_URL.includes('localhost')) {
        issues.push('CLIENT_URL points to localhost in production');
      }
    }
    
    if (issues.length > 0) {
      return { pass: false, message: `Debug settings found: ${issues.join(', ')}` };
    }
    
    return { pass: true, message: 'No debug settings detected' };
  }
};

const runSecurityCheck = () => {
  console.log('🔒 Running Security Check...\n');
  
  let allPassed = true;
  const results = [];

  // Run environment validation first
  try {
    validateEnvironment();
    console.log('✅ Environment validation passed\n');
  } catch (error) {
    console.error('❌ Environment validation failed:', error.message);
    allPassed = false;
    return;
  }

  // Run individual security checks
  Object.entries(securityChecks).forEach(([checkName, checkFunction]) => {
    try {
      const result = checkFunction();
      results.push({ name: checkName, ...result });
      
      const icon = result.pass ? '✅' : '❌';
      console.log(`${icon} ${checkName}: ${result.message}`);
      
      if (!result.pass) {
        allPassed = false;
      }
    } catch (error) {
      console.error(`❌ ${checkName}: Error running check - ${error.message}`);
      allPassed = false;
    }
  });

  console.log('\n' + '='.repeat(50));
  
  if (allPassed) {
    console.log('🎉 All security checks passed! Ready for production deployment.');
    process.exit(0);
  } else {
    console.log('⚠️  Security issues detected. Please fix the issues above before deploying to production.');
    console.log('\nFor help, see: PRODUCTION_SECURITY.md');
    process.exit(1);
  }
};

// Run the security check
runSecurityCheck();