// Authentication service for QPerform
// Uses QSoftware backend authentication (same as QClock, QTime, etc.)
import type { UserProfile, UserRole, UserPermissions } from '../types'

// Mock authentication for development
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true'

// QSoftware backend API URL
const QSOFTWARE_API_URL = import.meta.env.VITE_QSOFTWARE_API_URL || 'https://api.qsoftware.cloud/api'

// Token storage key
const ACCESS_TOKEN_KEY = 'qperform_access_token'

// Authorized job titles
const AUTHORIZED_TITLES = [
  'AVP', 'Assistant Vice President', 'Vice President', 'VP', 'Senior Vice President', 'SVP',
  'Director', 'Associate Director', 'Senior Director',
  'Manager', 'Senior Manager', 'Assistant Manager',
  'Supervisor', 'Senior Supervisor',
  'Team Lead', 'Team Leader', 'Lead',
]

// Auto-approved accounts (MIS Team, etc.)
const AUTO_APPROVED_EMAILS = [
  'ONQ.PowerBI.MIS@onqoc.com',
]

export const MIS_CONTACT = {
  email: 'ONQ.PowerBI.MIS@onqoc.com',
  name: 'MIS Team',
  role: 'Administrator',
}

/**
 * Store access token in localStorage
 */
export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

/**
 * Get access token from localStorage
 */
function getStoredAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

/**
 * Remove access token from localStorage
 */
export function deleteAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

/**
 * Fetch user profile from QSoftware backend
 */
async function fetchUserProfile(accessToken: string): Promise<UserProfile | null> {
  try {
    const response = await fetch(`${QSOFTWARE_API_URL}/auth/users/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      console.error('Failed to fetch user profile:', response.status, response.statusText)
      return null
    }

    const userData = await response.json()

    return {
      id: userData.id || userData.employeeNumber,
      email: userData.email || userData.businessEmail,
      displayName: userData.fullName || userData.displayName,
      jobTitle: userData.position || userData.jobTitle,
      department: userData.department,
    }
  } catch (error) {
    console.error('Error fetching user profile from QSoftware API:', error)
    return null
  }
}

/**
 * Gets the current authenticated user
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  if (USE_MOCK_AUTH) {
    console.log('Using mock authentication')
    return {
      id: 'dev-user-123',
      email: 'pablo.aguirre@onqglobal.com',
      displayName: 'Pablo Aguirre',
      jobTitle: 'Director',
      department: 'MIS',
    }
  }

  const token = getStoredAccessToken()
  if (!token) {
    console.log('No access token found')
    return null
  }

  return await fetchUserProfile(token)
}

/**
 * Checks if user is authorized based on email or job title
 */
export function isUserAuthorized(email?: string, jobTitle?: string): boolean {
  if (email) {
    const normalizedEmail = email.trim().toLowerCase()
    const isAutoApproved = AUTO_APPROVED_EMAILS.some(
      approvedEmail => normalizedEmail === approvedEmail.toLowerCase()
    )

    if (isAutoApproved) {
      console.log(`Auto-approved account: "${email}" - Administrator Access Granted`)
      return true
    }
  }

  if (!jobTitle) {
    console.warn('No job title provided for authorization check')
    return false
  }

  const normalizedTitle = jobTitle.trim().toLowerCase()
  const isAuthorized = AUTHORIZED_TITLES.some(
    authorizedTitle => normalizedTitle.includes(authorizedTitle.toLowerCase())
  )

  console.log(`Authorization check for "${jobTitle}": ${isAuthorized ? 'Granted' : 'Denied'}`)
  return isAuthorized
}

/**
 * Maps email and job title to a specific role
 */
export function getUserRole(email?: string, jobTitle?: string): UserRole {
  if (email) {
    const normalizedEmail = email.trim().toLowerCase()
    if (AUTO_APPROVED_EMAILS.some(approvedEmail => normalizedEmail === approvedEmail.toLowerCase())) {
      return 'Director' // Give MIS Team director-level access
    }
  }

  if (!jobTitle) {
    return 'Unauthorized'
  }

  const normalizedTitle = jobTitle.trim().toLowerCase()

  if (normalizedTitle.includes('avp') ||
      normalizedTitle.includes('assistant vice president') ||
      normalizedTitle.includes('vice president') ||
      normalizedTitle.includes('vp') ||
      normalizedTitle.includes('svp')) {
    return 'AVP'
  }

  if (normalizedTitle.includes('director')) {
    return 'Director'
  }

  if (normalizedTitle.includes('manager')) {
    return normalizedTitle.includes('assistant') ? 'Assistant Manager' : 'Manager'
  }

  if (normalizedTitle.includes('supervisor')) {
    return 'Supervisor'
  }

  if (normalizedTitle.includes('team lead') ||
      normalizedTitle.includes('team leader') ||
      normalizedTitle.includes('lead')) {
    return 'Team Lead'
  }

  return 'Agent'
}

/**
 * Gets user permissions based on role
 */
export function getUserPermissions(role: UserRole): UserPermissions {
  const canTakeAction = role === 'Director' || role === 'AVP'
  const canViewReports = role !== 'Unauthorized' && role !== 'Agent'
  const canViewAllClients = role === 'Director' || role === 'AVP'
  const receivesNotifications = role === 'Director' || role === 'AVP'

  return {
    canTakeAction,
    canViewReports,
    canViewAllClients,
    receivesNotifications,
  }
}

/**
 * Main authentication function
 */
export async function authenticateUser(): Promise<{
  user: UserProfile | null
  isAuthorized: boolean
  role: UserRole
}> {
  console.log('=== Starting authentication ===')
  console.log('USE_MOCK_AUTH:', USE_MOCK_AUTH)

  const user = await getCurrentUser()
  console.log('getCurrentUser result:', user ? { email: user.email, jobTitle: user.jobTitle, displayName: user.displayName } : 'null')

  if (!user) {
    console.log('No user after login attempts - returning Unauthorized')
    return {
      user: null,
      isAuthorized: false,
      role: 'Unauthorized',
    }
  }

  console.log('Authenticating user:', { email: user.email, jobTitle: user.jobTitle, displayName: user.displayName, department: user.department })

  const isAuthorized = isUserAuthorized(user.email, user.jobTitle)
  const role = isAuthorized ? getUserRole(user.email, user.jobTitle) : 'Unauthorized'

  console.log('Authorization check result:', { isAuthorized, role })
  console.log('=== Authentication complete ===')

  return {
    user,
    isAuthorized,
    role,
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  if (USE_MOCK_AUTH) {
    console.log('Mock user signed out')
    return
  }

  try {
    const token = getStoredAccessToken()
    if (token) {
      // Call backend logout endpoint
      await fetch(`${QSOFTWARE_API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    }

    // Remove token from localStorage
    deleteAccessToken()
    console.log('User signed out successfully')
  } catch (error) {
    console.error('Sign out error:', error)
    // Still delete token even if backend call fails
    deleteAccessToken()
  }
}

/**
 * Redirect to QSoftware backend for Microsoft authentication
 */
export function loginWithMicrosoft(): void {
  if (USE_MOCK_AUTH) {
    console.warn('Mock auth is enabled, skipping Microsoft login')
    return
  }

  // Redirect to QSoftware backend Microsoft auth endpoint
  const redirectUrl = `${QSOFTWARE_API_URL}/auth/microsoft`
  console.log('Redirecting to Microsoft login:', redirectUrl)
  window.location.href = redirectUrl
}

/**
 * Verify token from URL query parameter (after redirect from backend)
 */
export async function verifyTokenFromUrl(): Promise<boolean> {
  const urlParams = new URLSearchParams(window.location.search)
  const accessToken = urlParams.get('accessToken')

  if (!accessToken) {
    return false
  }

  try {
    // Verify token with backend
    const response = await fetch(`${QSOFTWARE_API_URL}/auth/verify-token`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      // Token is valid, store it
      setAccessToken(accessToken)

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)

      return true
    }

    return false
  } catch (error) {
    console.error('Error verifying token:', error)
    return false
  }
}

/**
 * Helper function to get access token for API calls
 */
export async function getAccessToken(): Promise<string | null> {
  if (USE_MOCK_AUTH) {
    return 'mock-token'
  }

  return getStoredAccessToken()
}
