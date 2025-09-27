# GitHub Actions Workflows

This directory contains GitHub Actions workflows for the Taskify application.

## Workflows Overview

### 1. Continuous Integration (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**
- **Frontend CI**: Linting, testing, and building the React frontend
- **Backend CI**: Testing and security checks for the Express backend
- **Security Scan**: Vulnerability scanning with Trivy
- **Dependency Check**: Audit for known vulnerabilities

**Matrix Strategy:**
- Tests run on Node.js versions 18.x and 20.x
- Ensures compatibility across supported Node versions

### 2. Production Deployment (`deploy.yml`)

**Triggers:**
- Push to `main` branch
- Manual workflow dispatch

**Jobs:**
- **Frontend Deployment**: Deploy to Netlify (primary) or Vercel (alternative)
- **Backend Deployment**: Deploy to Render (primary) or Heroku (alternative)
- **Health Check**: Verify deployments are working
- **Notifications**: Send deployment status notifications

### 3. Staging Deployment (`staging.yml`)

**Triggers:**
- Push to `develop` branch
- Pull requests to `main` branch

**Jobs:**
- **Staging Deployment**: Deploy to staging environment
- **E2E Tests**: Run end-to-end tests on staging
- **PR Comments**: Add staging URLs to pull request comments

### 4. Dependency Management (`dependencies.yml`)

**Triggers:**
- Weekly schedule (Mondays at 9 AM UTC)
- Manual workflow dispatch

**Jobs:**
- **Security Audit**: Check for vulnerabilities
- **Update Dependencies**: Automatically update and test dependencies
- **Outdated Check**: Generate reports of outdated packages

## Required Secrets

Configure these secrets in your GitHub repository settings:

### Frontend Deployment
```
VITE_API_URL                 # Production API URL
NETLIFY_SITE_ID             # Netlify site ID
NETLIFY_AUTH_TOKEN          # Netlify authentication token
NETLIFY_STAGING_SITE_ID     # Netlify staging site ID
VERCEL_TOKEN                # Vercel authentication token (if using Vercel)
VERCEL_ORG_ID               # Vercel organization ID
VERCEL_PROJECT_ID           # Vercel project ID
```

### Backend Deployment
```
RENDER_DEPLOY_HOOK_URL      # Render deployment webhook URL
HEROKU_API_KEY              # Heroku API key (if using Heroku)
HEROKU_APP_NAME             # Heroku app name
HEROKU_EMAIL                # Heroku account email
```

### Testing & Staging
```
TEST_MONGODB_URI            # MongoDB URI for testing
STAGING_MONGODB_URI         # MongoDB URI for staging
STAGING_API_URL             # Staging API URL
STAGING_FRONTEND_URL        # Staging frontend URL
STAGING_DEPLOY_HOOK_URL     # Staging deployment webhook
```

### Health Checks
```
FRONTEND_URL                # Production frontend URL
BACKEND_URL                 # Production backend URL
```

## Environment Variables

Each environment should have its own set of environment variables:

### Development
- Configured in `.env` files
- Used for local development

### Staging
- Configured in hosting platform (Netlify, Render)
- Used for testing and preview

### Production
- Configured in hosting platform
- Used for live application

## Workflow Features

### Security
- Automated vulnerability scanning
- Dependency auditing
- Security checks before deployment
- SARIF upload to GitHub Security tab

### Testing
- Unit tests for frontend and backend
- Integration tests with MongoDB
- E2E tests on staging environment
- Test coverage reporting

### Deployment
- Automated deployment on merge to main
- Staging deployments for testing
- Health checks after deployment
- Rollback capabilities

### Maintenance
- Weekly dependency updates
- Automated security patches
- Outdated dependency reports
- Issue creation for security vulnerabilities

## Customization

### Adding New Environments

1. Create new workflow file or add job to existing workflow
2. Configure environment-specific secrets
3. Update deployment scripts
4. Add health checks

### Changing Hosting Platforms

1. Update deployment jobs in workflows
2. Configure new platform secrets
3. Update health check URLs
4. Test deployment process

### Adding Notifications

Add notification steps to workflows:

```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify environment variables are set
   - Review build logs for specific errors

2. **Test Failures**
   - Ensure MongoDB service is running
   - Check test environment variables
   - Verify test database connectivity

3. **Deployment Failures**
   - Verify deployment secrets are configured
   - Check hosting platform status
   - Review deployment logs

4. **Security Scan Failures**
   - Update vulnerable dependencies
   - Review security scan results
   - Apply security patches

### Debugging Workflows

1. Enable debug logging:
   ```yaml
   env:
     ACTIONS_STEP_DEBUG: true
     ACTIONS_RUNNER_DEBUG: true
   ```

2. Add debug steps:
   ```yaml
   - name: Debug Environment
     run: |
       echo "Node version: $(node --version)"
       echo "NPM version: $(npm --version)"
       echo "Working directory: $(pwd)"
       ls -la
   ```

3. Use workflow dispatch for manual testing:
   ```yaml
   on:
     workflow_dispatch:
       inputs:
         debug:
           description: 'Enable debug mode'
           required: false
           default: 'false'
   ```

## Best Practices

1. **Keep secrets secure** - Never log or expose secret values
2. **Use matrix builds** - Test on multiple Node.js versions
3. **Cache dependencies** - Speed up builds with npm cache
4. **Fail fast** - Stop workflows early on critical failures
5. **Monitor workflows** - Set up notifications for failures
6. **Regular maintenance** - Keep workflows and actions updated