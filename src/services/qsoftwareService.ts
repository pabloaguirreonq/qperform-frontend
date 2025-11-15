// QSoftware API Service
// Provides authentication and user management through QSoftware backend
import axios, { type AxiosInstance } from 'axios'
import type { UserProfile } from '../types'

const QSOFTWARE_API_URL = import.meta.env.VITE_QSOFTWARE_API_URL || 'https://api.qsoftware.cloud/api'

// Create axios instance for QSoftware API
const qsoftwareClient: AxiosInstance = axios.create({
  baseURL: QSOFTWARE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Storage keys
const QSOFTWARE_TOKEN_KEY = 'qsoftware_token'
const QSOFTWARE_REFRESH_TOKEN_KEY = 'qsoftware_refresh_token'
const QSOFTWARE_USER_KEY = 'qsoftware_user'

// Request interceptor to add auth token
qsoftwareClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for token refresh
qsoftwareClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = getStoredRefreshToken()
        if (refreshToken) {
          const newToken = await refreshAccessToken(refreshToken)
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return qsoftwareClient(originalRequest)
          }
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and reject
        clearTokens()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

/**
 * Store authentication tokens
 */
export function setTokens(accessToken: string, refreshToken?: string): void {
  localStorage.setItem(QSOFTWARE_TOKEN_KEY, accessToken)
  if (refreshToken) {
    localStorage.setItem(QSOFTWARE_REFRESH_TOKEN_KEY, refreshToken)
  }
}

/**
 * Get stored access token
 */
export function getStoredToken(): string | null {
  return localStorage.getItem(QSOFTWARE_TOKEN_KEY)
}

/**
 * Get stored refresh token
 */
export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(QSOFTWARE_REFRESH_TOKEN_KEY)
}

/**
 * Clear all stored tokens and user data
 */
export function clearTokens(): void {
  localStorage.removeItem(QSOFTWARE_TOKEN_KEY)
  localStorage.removeItem(QSOFTWARE_REFRESH_TOKEN_KEY)
  localStorage.removeItem(QSOFTWARE_USER_KEY)
}

/**
 * Store user profile
 */
export function setUserProfile(user: UserProfile): void {
  localStorage.setItem(QSOFTWARE_USER_KEY, JSON.stringify(user))
}

/**
 * Get stored user profile
 */
export function getStoredUserProfile(): UserProfile | null {
  const stored = localStorage.getItem(QSOFTWARE_USER_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      console.error('Error parsing stored user profile:', e)
      return null
    }
  }
  return null
}

/**
 * Login with email and password
 */
export async function loginWithCredentials(
  email: string,
  password: string
): Promise<{
  success: boolean
  user?: UserProfile
  accessToken?: string
  refreshToken?: string
  message?: string
}> {
  try {
    const response = await qsoftwareClient.post('/auth/login', {
      email,
      password,
    })

    const { accessToken, refreshToken, user } = response.data

    if (accessToken && user) {
      setTokens(accessToken, refreshToken)
      setUserProfile(user)

      return {
        success: true,
        user,
        accessToken,
        refreshToken,
      }
    }

    return {
      success: false,
      message: 'Invalid response from server',
    }
  } catch (error: any) {
    console.error('QSoftware login error:', error)
    return {
      success: false,
      message: error.response?.data?.message || 'Login failed',
    }
  }
}

/**
 * Login with Microsoft SSO
 */
export async function loginWithMicrosoftSSO(
  microsoftToken: string
): Promise<{
  success: boolean
  user?: UserProfile
  accessToken?: string
  refreshToken?: string
  message?: string
}> {
  try {
    const response = await qsoftwareClient.post('/auth/microsoft-sso', {
      microsoftToken,
    })

    const { accessToken, refreshToken, user } = response.data

    if (accessToken && user) {
      setTokens(accessToken, refreshToken)
      setUserProfile(user)

      return {
        success: true,
        user,
        accessToken,
        refreshToken,
      }
    }

    return {
      success: false,
      message: 'Invalid response from server',
    }
  } catch (error: any) {
    console.error('QSoftware Microsoft SSO error:', error)
    return {
      success: false,
      message: error.response?.data?.message || 'Microsoft SSO failed',
    }
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await qsoftwareClient.post('/auth/refresh', {
      refreshToken,
    })

    const { accessToken } = response.data

    if (accessToken) {
      localStorage.setItem(QSOFTWARE_TOKEN_KEY, accessToken)
      return accessToken
    }

    return null
  } catch (error) {
    console.error('Token refresh error:', error)
    return null
  }
}

/**
 * Get current user profile from QSoftware API
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    // First check if we have a stored profile
    const stored = getStoredUserProfile()
    if (stored) {
      return stored
    }

    // If not, fetch from API
    const token = getStoredToken()
    if (!token) {
      return null
    }

    const response = await qsoftwareClient.get('/auth/me')
    const user = response.data

    if (user) {
      setUserProfile(user)
      return user
    }

    return null
  } catch (error) {
    console.error('Error fetching current user:', error)
    return null
  }
}

/**
 * Validate user access for QPerform
 */
export async function validateUserAccess(): Promise<{
  hasAccess: boolean
  role?: string
  permissions?: any
  message?: string
}> {
  try {
    const response = await qsoftwareClient.get('/auth/validate-access', {
      params: {
        application: 'qperform',
      },
    })

    return {
      hasAccess: response.data.hasAccess,
      role: response.data.role,
      permissions: response.data.permissions,
    }
  } catch (error: any) {
    console.error('Error validating user access:', error)
    return {
      hasAccess: false,
      message: error.response?.data?.message || 'Access validation failed',
    }
  }
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    const token = getStoredToken()
    if (token) {
      await qsoftwareClient.post('/auth/logout')
    }
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    clearTokens()
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getStoredToken()
  return !!token
}

/**
 * Initiate Microsoft OAuth flow through QSoftware
 * This will redirect the user to Microsoft login, then back to QSoftware callback,
 * and finally back to the specified redirectUrl (your localhost app)
 */
export function initiateOAuthLogin(redirectUrl?: string): void {
  const actualRedirectUrl = redirectUrl || window.location.origin
  const qsoftwareAuthUrl = `${QSOFTWARE_API_URL}/auth/microsoft/login`

  // Build the OAuth URL with redirect parameter
  const params = new URLSearchParams({
    redirect_uri: actualRedirectUrl + '/auth/callback',
  })

  // Store the original URL to return to after auth
  localStorage.setItem('qsoftware_auth_return_url', window.location.href)

  // Redirect to QSoftware OAuth endpoint
  window.location.href = `${qsoftwareAuthUrl}?${params.toString()}`
}

/**
 * Handle OAuth callback from QSoftware
 * Extract tokens from URL parameters and store them
 */
export function handleOAuthCallback(): {
  success: boolean
  accessToken?: string
  refreshToken?: string
  error?: string
} {
  const params = new URLSearchParams(window.location.search)

  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')
  const error = params.get('error')

  if (error) {
    console.error('OAuth callback error:', error)
    return { success: false, error }
  }

  if (accessToken) {
    setTokens(accessToken, refreshToken || undefined)

    // Clear the URL parameters
    window.history.replaceState({}, document.title, window.location.pathname)

    return { success: true, accessToken, refreshToken: refreshToken || undefined }
  }

  return { success: false, error: 'No access token received' }
}

/**
 * Get the return URL after authentication
 */
export function getAuthReturnUrl(): string {
  const returnUrl = localStorage.getItem('qsoftware_auth_return_url')
  localStorage.removeItem('qsoftware_auth_return_url')
  return returnUrl || '/'
}

export default qsoftwareClient
