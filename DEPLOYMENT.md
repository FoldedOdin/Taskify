# Deployment Guide

This guide covers deploying the Taskify application to various hosting platforms.

## Prerequisites

Before deploying, ensure you have:

1. **Environment Variables Configured**: Copy `.env.example` files and fill in production values
2. **Database Setup**: MongoDB Atlas cluster configured for production
3. **Security Review**: Run security checks and audits
4. **Testing Complete**: All tests passing

## Frontend Deployment

### Netlify Deployment

1. **Connect Repository**:
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build:prod`
   - Set publish directory: `dist`

2. **Environment Variables**:
   ```
   VITE_API_URL=https://your-api-domain.com
   VITE_APP_NAME=Taskify
   VITE_ENVIRONMENT=production
   ```

3. **Deploy**:
   - Push to main branch for automatic deployment
   - Or use Netlify CLI: `netlify deploy --prod`

### Vercel Deployment

1. **Connect Repository**:
   - Import project from GitHub to Vercel
   - Framework preset: Vite
   - Build command: `npm run build:prod`
   - Output directory: `dist`

2. **Environment Variables**:
   ```
   VITE_API_URL=https://your-api-domain.com
   VITE_APP_NAME=Taskify
   VITE_ENVIRONMENT=production
   ```

3. **Deploy**:
   - Push to main branch for automatic deployment
   - Or use Vercel CLI: `vercel --prod`

## Backend Deployment

### Render Deployment

1. **Create Web Service**:
   - Connect GitHub repository
   - Use `server` directory as root
   - Build command: `npm install`
   - Start command: `npm run start:prod`

2. **Environment Variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your-secure-jwt-secret
   CLIENT_URL=https://your-frontend-domain.com
   LOG_LEVEL=warn
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

3. **Database**:
   - Create MongoDB database in Render
   - Or use MongoDB Atlas

### Heroku Deployment

1. **Create App**:
   ```bash
   heroku create taskify-api
   heroku addons:create mongolab:sandbox
   ```

2. **Set Environment Variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secure-jwt-secret
   heroku config:set CLIENT_URL=https://your-frontend-domain.com
   ```

3. **Deploy**:
   ```bash
   git subtree push --prefix server heroku main
   ```

## Database Setup

### MongoDB Atlas

1. **Create Cluster**:
   - Create production cluster
   - Configure network access (0.0.0.0/0 for cloud deployment)
   - Create database user

2. **Connection String**:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/taskify-prod?retryWrites=true&w=majority
   ```

## Security Checklist

Before deploying to production:

- [ ] Update all default passwords and secrets
- [ ] Configure CORS for production domains only
- [ ] Enable rate limiting
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure security headers
- [ ] Run security audit: `npm audit`
- [ ] Review environment variables
- [ ] Test authentication flows
- [ ] Verify database access controls

## Monitoring and Logging

### Production Monitoring

1. **Health Checks**:
   - Frontend: Monitor build and deployment status
   - Backend: Use `/health` endpoint for uptime monitoring

2. **Logging**:
   - Backend logs are written to `logs/app.log` in production
   - Configure log rotation and monitoring
   - Set up error alerting

3. **Performance**:
   - Monitor API response times
   - Track database query performance
   - Monitor frontend bundle size and load times

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Verify `CLIENT_URL` environment variable
   - Check CORS configuration in backend

2. **Database Connection**:
   - Verify MongoDB URI format
   - Check network access settings
   - Confirm database user permissions

3. **Authentication Issues**:
   - Verify JWT secret is set and secure
   - Check token expiration settings
   - Confirm HTTPS is enabled

4. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs for specific errors

### Rollback Procedure

If deployment fails:

1. **Frontend**: Revert to previous deployment in hosting platform
2. **Backend**: Redeploy previous working version
3. **Database**: Restore from backup if schema changes were made

## Performance Optimization

### Frontend Optimizations

- Bundle splitting and code splitting enabled
- Static assets cached with long expiration
- Gzip compression enabled
- Service worker for offline functionality (optional)

### Backend Optimizations

- Request timeout configured
- Rate limiting enabled
- Database connection pooling
- Response compression
- Proper HTTP caching headers

## Maintenance

### Regular Tasks

- Monitor security advisories and update dependencies
- Review and rotate secrets periodically
- Monitor database performance and optimize queries
- Review logs for errors and performance issues
- Update SSL certificates before expiration

### Backup Strategy

- Database: Automated daily backups via MongoDB Atlas
- Code: Version control with Git
- Environment configs: Secure backup of production environment variables