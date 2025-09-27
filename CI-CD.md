# CI/CD Pipeline Documentation

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipeline for the Taskify application.

## Overview

The CI/CD pipeline is implemented using GitHub Actions and provides:

- **Automated Testing**: Unit tests, integration tests, and E2E tests
- **Code Quality**: Linting, formatting, and security checks
- **Automated Deployment**: Deploy to staging and production environments
- **Dependency Management**: Automated updates and security audits
- **Monitoring**: Health checks and deployment notifications

## Pipeline Architecture

```mermaid
graph TB
    A[Code Push] --> B[CI Pipeline]
    B --> C{Branch?}
    C -->|develop| D[Staging Deployment]
    C -->|main| E[Production Deployment]
    C -->|feature/*| F[PR Checks]
    
    B --> G[Tests]
    B --> H[Security Scan]
    B --> I[Build]
    
    D --> J[Staging Tests]
    E --> K[Health Checks]
    F --> L[Preview Deploy]
    
    G --> M[Unit Tests]
    G --> N[Integration Tests]
    J --> O[E2E Tests]
```

## Workflows

### 1. Continuous Integration (`ci.yml`)

**Purpose**: Validate code quality and functionality on every push and PR.

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs**:
- **Frontend CI**: 
  - Install dependencies
  - Run ESLint and Prettier checks
  - Execute unit tests with Vitest
  - Generate test coverage reports
  - Build production bundle
  - Upload build artifacts

- **Backend CI**:
  - Install dependencies
  - Run security audit
  - Execute tests with Jest
  - Generate coverage reports
  - Run security checks

- **Security Scan**:
  - Trivy vulnerability scanner
  - Upload results to GitHub Security tab

- **Dependency Check**:
  - Audit for known vulnerabilities
  - Check for outdated packages

**Matrix Strategy**: Tests run on Node.js 18.x and 20.x

### 2. Production Deployment (`deploy.yml`)

**Purpose**: Deploy application to production environment.

**Triggers**:
- Push to `main` branch
- Manual workflow dispatch

**Jobs**:
- **Frontend Deployment**:
  - Build production bundle
  - Deploy to Netlify (primary) or Vercel (alternative)
  - Configure CDN and caching

- **Backend Deployment**:
  - Run pre-deployment checks
  - Deploy to Render (primary) or Heroku (alternative)
  - Configure environment variables

- **Health Checks**:
  - Verify frontend accessibility
  - Test backend API endpoints
  - Validate authentication flows

- **Notifications**:
  - Send deployment status updates
  - Create deployment records

### 3. Staging Deployment (`staging.yml`)

**Purpose**: Deploy to staging environment for testing.

**Triggers**:
- Push to `develop` branch
- Pull requests to `main` branch

**Jobs**:
- **Staging Deployment**:
  - Deploy frontend to staging subdomain
  - Deploy backend to staging environment
  - Configure staging-specific settings

- **E2E Tests**:
  - Run Playwright tests against staging
  - Test critical user flows
  - Generate test reports

- **PR Integration**:
  - Comment on PRs with staging URLs
  - Provide testing instructions

### 4. Dependency Management (`dependencies.yml`)

**Purpose**: Maintain up-to-date and secure dependencies.

**Triggers**:
- Weekly schedule (Mondays at 9 AM UTC)
- Manual workflow dispatch

**Jobs**:
- **Security Audit**:
  - Scan for vulnerabilities
  - Create issues for critical findings
  - Generate security reports

- **Dependency Updates**:
  - Update to latest compatible versions
  - Run tests after updates
  - Create automated PRs

- **Outdated Reports**:
  - Generate dependency status reports
  - Track technical debt

## Environment Configuration

### Development
- **Frontend**: `http://localhost:5174`
- **Backend**: `http://localhost:3001`
- **Database**: Local MongoDB or MongoDB Atlas development cluster

### Staging
- **Frontend**: `https://staging-taskify.netlify.app`
- **Backend**: `https://staging-taskify-api.render.com`
- **Database**: MongoDB Atlas staging cluster

### Production
- **Frontend**: `https://taskify.netlify.app`
- **Backend**: `https://taskify-api.render.com`
- **Database**: MongoDB Atlas production cluster

## Required Secrets

Configure these secrets in GitHub repository settings:

### Deployment Secrets
```bash
# Netlify
NETLIFY_SITE_ID=your-site-id
NETLIFY_AUTH_TOKEN=your-auth-token
NETLIFY_STAGING_SITE_ID=your-staging-site-id

# Vercel (alternative)
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id

# Render
RENDER_DEPLOY_HOOK_URL=https://api.render.com/deploy/srv-xxx

# Heroku (alternative)
HEROKU_API_KEY=your-api-key
HEROKU_APP_NAME=your-app-name
HEROKU_EMAIL=your-email
```

### Environment URLs
```bash
# Production
FRONTEND_URL=https://taskify.netlify.app
BACKEND_URL=https://taskify-api.render.com
VITE_API_URL=https://taskify-api.render.com

# Staging
STAGING_FRONTEND_URL=https://staging-taskify.netlify.app
STAGING_API_URL=https://staging-taskify-api.render.com
STAGING_DEPLOY_HOOK_URL=https://api.render.com/deploy/srv-staging-xxx
```

### Database & Testing
```bash
# Testing
TEST_MONGODB_URI=mongodb://localhost:27017/taskify-test
STAGING_MONGODB_URI=mongodb+srv://user:pass@staging-cluster.mongodb.net/taskify-staging
```

## Deployment Process

### Automatic Deployment

1. **Feature Development**:
   ```bash
   git checkout -b feature/new-feature
   # Make changes
   git commit -m "feat: add new feature"
   git push origin feature/new-feature
   ```

2. **Create Pull Request**:
   - CI pipeline runs automatically
   - Staging deployment created
   - E2E tests executed
   - Code review process

3. **Merge to Main**:
   ```bash
   git checkout main
   git merge feature/new-feature
   git push origin main
   ```

4. **Production Deployment**:
   - Automatic deployment triggered
   - Health checks performed
   - Notifications sent

### Manual Deployment

Use GitHub Actions UI to trigger manual deployments:

1. Go to Actions tab in GitHub repository
2. Select "Deploy to Production" workflow
3. Click "Run workflow"
4. Select environment and confirm

## Monitoring and Alerting

### Health Checks

**Frontend Health Check**:
```bash
curl -f https://taskify.netlify.app
```

**Backend Health Check**:
```bash
curl -f https://taskify-api.render.com/health
```

**API Functionality Check**:
```bash
curl -f https://taskify-api.render.com/api/auth/health
```

### Monitoring Tools

- **Uptime Monitoring**: Configure external monitoring service
- **Error Tracking**: Implement error reporting (Sentry, Bugsnag)
- **Performance Monitoring**: Track Core Web Vitals
- **Log Aggregation**: Centralized logging solution

### Alerting

Set up alerts for:
- Deployment failures
- Health check failures
- Security vulnerabilities
- Performance degradation
- High error rates

## Rollback Procedures

### Frontend Rollback

**Netlify**:
```bash
# Via Netlify CLI
netlify sites:list
netlify api listSiteDeploys --data='{"site_id":"YOUR_SITE_ID"}'
netlify api restoreSiteDeploy --data='{"site_id":"YOUR_SITE_ID","deploy_id":"PREVIOUS_DEPLOY_ID"}'
```

**Vercel**:
```bash
# Via Vercel CLI
vercel list
vercel rollback [deployment-url]
```

### Backend Rollback

**Render**:
1. Go to Render dashboard
2. Select your service
3. Go to "Deploys" tab
4. Click "Rollback" on previous successful deployment

**Heroku**:
```bash
heroku releases --app your-app-name
heroku rollback v123 --app your-app-name
```

### Database Rollback

1. **Schema Changes**: Use migration rollback scripts
2. **Data Changes**: Restore from backup
3. **Configuration**: Revert environment variables

## Performance Optimization

### Build Optimization

- **Bundle Splitting**: Separate vendor and application code
- **Tree Shaking**: Remove unused code
- **Minification**: Compress JavaScript and CSS
- **Asset Optimization**: Compress images and fonts

### Deployment Optimization

- **CDN**: Use content delivery network for static assets
- **Caching**: Configure appropriate cache headers
- **Compression**: Enable gzip/brotli compression
- **HTTP/2**: Use modern HTTP protocol

### Database Optimization

- **Connection Pooling**: Reuse database connections
- **Indexing**: Optimize database queries
- **Caching**: Implement Redis for session storage
- **Monitoring**: Track query performance

## Security Considerations

### Code Security

- **Dependency Scanning**: Regular vulnerability audits
- **Static Analysis**: Code quality and security checks
- **Secret Management**: Secure handling of sensitive data
- **Access Control**: Proper authentication and authorization

### Deployment Security

- **HTTPS**: Enforce secure connections
- **Security Headers**: Implement security headers
- **Environment Isolation**: Separate staging and production
- **Access Logs**: Monitor and log access attempts

### Infrastructure Security

- **Network Security**: Configure firewalls and VPNs
- **Database Security**: Encrypt data at rest and in transit
- **Backup Security**: Secure and test backup procedures
- **Incident Response**: Plan for security incidents

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Node.js version compatibility
   - Verify environment variables
   - Review dependency conflicts

2. **Test Failures**:
   - Check test environment setup
   - Verify database connectivity
   - Review test data and mocks

3. **Deployment Failures**:
   - Verify deployment secrets
   - Check hosting platform status
   - Review deployment logs

4. **Health Check Failures**:
   - Verify application startup
   - Check database connectivity
   - Review error logs

### Debug Steps

1. **Enable Debug Logging**:
   ```yaml
   env:
     ACTIONS_STEP_DEBUG: true
     ACTIONS_RUNNER_DEBUG: true
   ```

2. **Check Workflow Logs**:
   - Go to Actions tab in GitHub
   - Select failed workflow run
   - Review step-by-step logs

3. **Test Locally**:
   ```bash
   # Run the same commands locally
   npm ci
   npm run test:run
   npm run build:prod
   ```

4. **Verify Configuration**:
   - Check environment variables
   - Verify secrets are set
   - Confirm hosting platform settings

## Best Practices

### Code Quality

- **Consistent Formatting**: Use Prettier and ESLint
- **Test Coverage**: Maintain high test coverage
- **Code Reviews**: Require peer review for all changes
- **Documentation**: Keep documentation up to date

### Deployment

- **Gradual Rollouts**: Use feature flags for gradual releases
- **Blue-Green Deployment**: Minimize downtime during deployments
- **Automated Testing**: Comprehensive test coverage
- **Monitoring**: Continuous monitoring of application health

### Security

- **Regular Updates**: Keep dependencies up to date
- **Security Scanning**: Regular vulnerability assessments
- **Access Control**: Principle of least privilege
- **Incident Response**: Prepared response procedures

### Maintenance

- **Regular Reviews**: Periodic review of CI/CD processes
- **Performance Monitoring**: Track and optimize performance
- **Capacity Planning**: Plan for growth and scaling
- **Documentation**: Keep runbooks and procedures updated