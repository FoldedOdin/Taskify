# API Client Authentication Integration

This document explains how the authentication system is integrated with the API client.

## Overview

The API client (`api.js`) has been enhanced with comprehensive authentication handling that includes:

1. **Automatic JWT Token Injection**: Adds JWT tokens to request headers
2. **Token Expiration Checking**: Validates tokens before making requests
3. **Authentication Error Handling**: Handles 401/403 responses gracefully
4. **Automatic Logout**: Clears authentication state on token expiration
5. **Redirect Handling**: Redirects users to login when authentication fails

## Key Features

### Request Interceptor
- Automatically adds `Authorization: Bearer <token>` header to all requests
- Checks if token is expired before making requests
- Prevents requests with expired tokens and logs out user immediately

### Response Interceptor
- Handles 401 (Unauthorized) responses by clearing auth state and redirecting
- Handles 403 (Forbidden) responses with appropriate error messages
- Handles server errors (5xx) with user-friendly messages
- Handles network errors gracefully

### Token Management
- `isAuthenticated()`: Checks if user has a valid, non-expired token
- `getToken()`: Returns current token if valid, null otherwise
- `clearAuth()`: Clears token and authentication state

### Integration with AuthContext
- API client communicates with AuthContext via `setAuthDispatch()`
- Automatically updates authentication state when tokens expire
- Maintains consistency between API client and React state

## Usage

The authentication integration is automatic. All API calls through the `apiClient` will:

1. Include authentication headers if user is logged in
2. Handle authentication errors automatically
3. Redirect to login page when authentication fails
4. Update React state to reflect authentication changes

## Error Handling

### 401 Unauthorized
- Token is invalid or expired
- User is automatically logged out
- Redirected to home page to show login modal
- User-friendly message for token expiration

### 403 Forbidden
- User doesn't have permission for the requested resource
- Error is logged but user remains authenticated

### 5xx Server Errors
- Server-side errors are handled gracefully
- User-friendly error messages are shown

### Network Errors
- Connection issues are handled with appropriate messaging
- User can retry requests when connection is restored

## Testing

The authentication system includes comprehensive tests covering:
- Token validation logic
- Authentication state management
- Error handling scenarios
- Integration with AuthContext

Run tests with: `npm run test:run`

## Security Considerations

- JWT tokens are validated for expiration before each request
- Tokens are automatically cleared when expired or invalid
- No sensitive data is logged in production
- Authentication state is kept in sync across the application