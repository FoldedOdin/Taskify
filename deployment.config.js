/**
 * Deployment Configuration
 * Configuration for different deployment environments
 */

export const deploymentConfig = {
  // Development environment
  development: {
    frontend: {
      buildCommand: 'npm run build',
      outputDir: 'dist',
      envFile: '.env'
    },
    backend: {
      startCommand: 'npm run dev',
      envFile: '.env'
    }
  },

  // Production environment
  production: {
    frontend: {
      buildCommand: 'npm run build:prod',
      outputDir: 'dist',
      envFile: '.env.production',
      optimizations: {
        minify: true,
        sourcemap: false,
        treeshaking: true
      }
    },
    backend: {
      startCommand: 'npm run start:prod',
      envFile: '.env.production',
      features: {
        logging: true,
        rateLimiting: true,
        compression: true,
        security: true
      }
    }
  },

  // Staging environment
  staging: {
    frontend: {
      buildCommand: 'npm run build',
      outputDir: 'dist',
      envFile: '.env.staging'
    },
    backend: {
      startCommand: 'npm run start:prod',
      envFile: '.env.staging'
    }
  }
};

// Platform-specific configurations
export const platformConfig = {
  // Netlify configuration
  netlify: {
    buildCommand: 'npm run build:prod',
    publishDir: 'dist',
    redirects: [
      {
        from: '/*',
        to: '/index.html',
        status: 200
      }
    ],
    headers: [
      {
        for: '/*',
        values: {
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin'
        }
      },
      {
        for: '/static/*',
        values: {
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      }
    ]
  },

  // Vercel configuration
  vercel: {
    buildCommand: 'npm run build:prod',
    outputDirectory: 'dist',
    framework: 'vite',
    rewrites: [
      {
        source: '/(.*)',
        destination: '/index.html'
      }
    ]
  },

  // Render configuration
  render: {
    type: 'web_service',
    buildCommand: 'npm install && npm run build:prod',
    startCommand: 'npm run start:prod',
    healthCheckPath: '/health'
  },

  // Heroku configuration
  heroku: {
    buildpacks: ['heroku/nodejs'],
    scripts: {
      'heroku-postbuild': 'npm run build:prod'
    },
    env: {
      NODE_ENV: 'production'
    }
  }
};

export default { deploymentConfig, platformConfig };