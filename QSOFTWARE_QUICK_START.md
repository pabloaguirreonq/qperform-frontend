# QSoftware API Integration - Quick Start Guide

## Setup (5 minutes)

### 1. Update Environment Variables

Add to your `.env` file:

```env
VITE_QSOFTWARE_API_URL=https://api.qsoftware.cloud/api
VITE_AUTH_MODE=qsoftware
```

### 2. Install Dependencies (if needed)

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

That's it! 🎉

## Usage Examples

### Login with Microsoft

```typescript
import { loginWithMicrosoft } from './services/authService'

// User clicks "Login" button
const success = await loginWithMicrosoft()
if (success) {
  console.log('User logged in!')
}
```

### Login with Email/Password

```typescript
import { loginWithCredentials } from './services/authService'

// User submits login form
const success = await loginWithCredentials(
  'user@example.com',
  'password123'
)
```

### Get Current User

```typescript
import { getCurrentUser } from './services/authService'

const user = await getCurrentUser()
console.log(user?.email) // user@example.com
console.log(user?.displayName) // John Doe
```

### Logout

```typescript
import { signOut } from './services/authService'

await signOut()
// User is logged out from both QSoftware and Microsoft
```

## Configuration Modes

### QSoftware Mode (Production)
```env
VITE_AUTH_MODE=qsoftware
```
- Uses QSoftware API for authentication
- Supports Microsoft SSO
- Recommended for production

### Microsoft Mode (Fallback)
```env
VITE_AUTH_MODE=microsoft
```
- Uses Microsoft authentication directly
- Bypasses QSoftware API
- Useful for demos or troubleshooting

## API Integration

All API calls automatically include authentication tokens:

```typescript
import { fetchPerformanceData } from './services/api'

// Token is automatically added to request headers
const data = await fetchPerformanceData({ month: 'January' })
```

## Token Management

Tokens are managed automatically:

- ✅ Stored securely in localStorage
- ✅ Auto-refresh when expired
- ✅ Cleared on logout
- ✅ No manual intervention needed

## Testing

### Test Login Flow

1. Open browser to `http://localhost:5173`
2. Click "Sign in with Microsoft"
3. Authenticate with Microsoft
4. Check browser console for logs:
   ```
   ✓ Microsoft login successful
   ✓ Authenticating with QSoftware API using Microsoft token...
   ✓ QSoftware SSO authentication successful
   ```

### Test Token Refresh

1. Login to the app
2. Open DevTools → Application → Local Storage
3. Delete `qsoftware_token`
4. Navigate to any page that makes API calls
5. Token should auto-refresh
6. Page should load normally

## Troubleshooting

### Issue: Can't login

**Check:**
- Is `VITE_QSOFTWARE_API_URL` set correctly?
- Is QSoftware API accessible?
- Check browser console for errors

**Quick Fix:**
```bash
# Switch to Microsoft mode
echo "VITE_AUTH_MODE=microsoft" >> .env
```

### Issue: API calls fail with 401

**Check:**
- Is user logged in?
- Are tokens stored in localStorage?
- Check Network tab for auth headers

**Quick Fix:**
```bash
# Clear localStorage and login again
localStorage.clear()
```

## Key Files

| File | Purpose |
|------|---------|
| [src/services/qsoftwareService.ts](src/services/qsoftwareService.ts) | QSoftware API client |
| [src/services/authService.ts](src/services/authService.ts) | Authentication service |
| [src/services/api.ts](src/services/api.ts) | API client with auth interceptors |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_QSOFTWARE_API_URL` | Yes | - | QSoftware API base URL |
| `VITE_AUTH_MODE` | No | `qsoftware` | Auth mode: `qsoftware` or `microsoft` |
| `VITE_DATAVERSE_CLIENT_ID` | Yes | - | Azure AD client ID |
| `VITE_DATAVERSE_TENANT_ID` | Yes | - | Azure AD tenant ID |

## Production Deployment

### 1. Update `.env.production`

```env
VITE_API_URL=https://your-backend.com
VITE_QSOFTWARE_API_URL=https://api.qsoftware.cloud/api
VITE_AUTH_MODE=qsoftware
VITE_USE_MOCK_AUTH=false
```

### 2. Build

```bash
npm run build:prod
```

### 3. Deploy

```bash
# Example: Deploy to Vercel
npm run deploy:vercel

# Example: Deploy to Netlify
npm run deploy:netlify
```

## Learn More

- 📖 [Full Integration Guide](QSOFTWARE_AUTH_INTEGRATION.md)
- 📋 [Integration Summary](INTEGRATION_SUMMARY.md)
- 🔧 [API Documentation](https://api.qsoftware.cloud/docs)

## Support

Need help? Contact:
- Frontend Team: For QPerform frontend issues
- QSoftware Team: For API and backend issues
- DevOps Team: For deployment issues

---

**Last Updated**: 2025-11-13
**Version**: 1.0.0
