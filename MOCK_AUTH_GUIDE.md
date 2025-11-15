# Mock Authentication Guide

## Overview
Mock authentication allows you to bypass Microsoft authentication during development, making it faster to test different user roles and permissions without needing to log in each time.

## Configuration

### Enable Mock Authentication
In your [.env](.env) file, set:
```env
VITE_AUTH_MODE=mock
```

### Choose User Role
Set the desired mock user role:
```env
VITE_MOCK_USER_ROLE=director
```

## Available Mock User Roles

| Role | Job Title | Email | Access Level |
|------|-----------|-------|--------------|
| `director` | Director | mock.director@onqoc.com | Full access, can take action |
| `avp` | Assistant Vice President | mock.avp@onqoc.com | Full access, can take action |
| `manager` | Manager | mock.manager@onqoc.com | Can view reports |
| `supervisor` | Supervisor | mock.supervisor@onqoc.com | Can view reports |
| `team_lead` | Team Lead | mock.lead@onqoc.com | Can view reports |
| `agent` | Agent | mock.agent@onqoc.com | Limited access |
| `unauthorized` | Intern | mock.unauthorized@onqoc.com | Access denied |

## Testing Different Roles

### Example 1: Test as Director
```env
VITE_AUTH_MODE=mock
VITE_MOCK_USER_ROLE=director
```
- Full dashboard access
- Can take actions on performance issues
- Receives notifications

### Example 2: Test as Manager
```env
VITE_AUTH_MODE=mock
VITE_MOCK_USER_ROLE=manager
```
- Can view reports
- Cannot take actions
- No notifications

### Example 3: Test Unauthorized Access
```env
VITE_AUTH_MODE=mock
VITE_MOCK_USER_ROLE=unauthorized
```
- Should see "Access Denied" screen
- Good for testing access control

## Switching Back to Real Authentication

### Microsoft Authentication
```env
VITE_AUTH_MODE=microsoft
```

### QSoftware Authentication
```env
VITE_AUTH_MODE=qsoftware
```

## User Profile Structure

Each mock user has the following profile:
```typescript
{
  id: string              // Unique identifier
  email: string          // Mock email address
  displayName: string    // Full name
  jobTitle: string       // Job title for authorization
  department: string     // Department name
}
```

## Console Logging

When mock authentication is active, you'll see console messages like:
```
⚠️ MOCK MODE ACTIVE - Using mock user profile: director
Mock authentication: Using director profile {email: "mock.director@onqoc.com", ...}
```

## Security Note

**IMPORTANT:** Mock authentication is for development only. Never deploy with `VITE_AUTH_MODE=mock` in production. The production build should always use real authentication (`microsoft` or `qsoftware`).

## Troubleshooting

### App shows "Access Denied"
- Check that your `VITE_MOCK_USER_ROLE` is set to an authorized role (director, avp, manager, etc.)
- Verify that the [.env](.env) file changes are reflected (you may need to restart the dev server)

### Changes not taking effect
1. Stop your development server
2. Update the [.env](.env) file
3. Restart your development server: `npm run dev`

### Want to test a custom role
You can add new mock users in [src/services/authService.ts](src/services/authService.ts) in the `MOCK_USERS` object.
