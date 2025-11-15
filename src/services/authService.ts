// Authentication service for QPerform
// Uses QSoftware API for authentication with Microsoft SSO fallback
import type { UserProfile, UserRole, UserPermissions } from '../types'
import { PublicClientApplication } from '@azure/msal-browser'
import { msalConfig, loginRequest } from '../config/authConfig'
import * as QSoftware from './qsoftwareService'

// Authentication mode: 'qsoftware' (default), 'microsoft' (fallback), or 'mock' (development)
const AUTH_MODE = import.meta.env.VITE_AUTH_MODE || 'qsoftware'
const MOCK_USER_ROLE = import.meta.env.VITE_MOCK_USER_ROLE || 'director'

// Initialize MSAL instance
let msalInstance: PublicClientApplication | null = null

async function getMsalInstance(): Promise<PublicClientApplication> {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig)
    await msalInstance.initialize()
  }
  return msalInstance
}

// Token storage key (kept for potential future use)
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

// Mock user profiles for development
const MOCK_USERS: Record<string, UserProfile> = {
  director: {
    id: 'mock-director-001',
    email: 'mock.director@onqoc.com',
    displayName: 'Mock Director',
    jobTitle: 'Director',
    department: 'Development Team',
  },
  avp: {
    id: 'mock-avp-001',
    email: 'mock.avp@onqoc.com',
    displayName: 'Mock AVP',
    jobTitle: 'Assistant Vice President',
    department: 'Development Team',
  },
  manager: {
    id: 'mock-manager-001',
    email: 'mock.manager@onqoc.com',
    displayName: 'Mock Manager',
    jobTitle: 'Manager',
    department: 'Development Team',
  },
  supervisor: {
    id: 'mock-supervisor-001',
    email: 'mock.supervisor@onqoc.com',
    displayName: 'Mock Supervisor',
    jobTitle: 'Supervisor',
    department: 'Development Team',
  },
  team_lead: {
    id: 'mock-lead-001',
    email: 'mock.lead@onqoc.com',
    displayName: 'Mock Team Lead',
    jobTitle: 'Team Lead',
    department: 'Development Team',
  },
  agent: {
    id: 'mock-agent-001',
    email: 'mock.agent@onqoc.com',
    displayName: 'Mock Agent',
    jobTitle: 'Agent',
    department: 'Development Team',
  },
  unauthorized: {
    id: 'mock-unauthorized-001',
    email: 'mock.unauthorized@onqoc.com',
    displayName: 'Mock Unauthorized User',
    jobTitle: 'Intern',
    department: 'Development Team',
  },
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
 * Get mock user profile for development
 */
function getMockUserProfile(): UserProfile | null {
  const mockUser = MOCK_USERS[MOCK_USER_ROLE]

  if (!mockUser) {
    console.error(`Invalid mock user role: ${MOCK_USER_ROLE}. Using director as default.`)
    return MOCK_USERS.director
  }

  console.log(`Mock authentication: Using ${MOCK_USER_ROLE} profile`, {
    email: mockUser.email,
    displayName: mockUser.displayName,
    jobTitle: mockUser.jobTitle,
  })

  return mockUser
}

/**
 * Fetch user profile from QSoftware API
 */
async function fetchUserProfileFromQSoftware(): Promise<UserProfile | null> {
  try {
    console.log('Fetching user profile from QSoftware API...')
    const user = await QSoftware.getCurrentUserProfile()

    if (user) {
      console.log('QSoftware user profile retrieved:', { email: user.email, displayName: user.displayName })
      return user
    }

    console.log('No user profile found in QSoftware')
    return null
  } catch (error) {
    console.error('Error fetching user profile from QSoftware:', error)
    return null
  }
}

/**
 * Fetch user profile from Microsoft Graph API (Fallback method)
 */
async function fetchUserProfileFromMicrosoft(): Promise<UserProfile | null> {
  try {
    const msal = await getMsalInstance()
    const accounts = msal.getAllAccounts()

    if (accounts.length === 0) {
      console.log('No Microsoft accounts found')
      return null
    }

    // Get access token for Microsoft Graph
    const request = {
      ...loginRequest,
      scopes: ['User.Read'],
      account: accounts[0],
    }

    let tokenResponse
    try {
      tokenResponse = await msal.acquireTokenSilent(request)
    } catch (error) {
      console.log('Silent token acquisition failed, trying popup...')
      tokenResponse = await msal.acquireTokenPopup(request)
    }

    // Fetch user profile from Microsoft Graph
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${tokenResponse.accessToken}`,
      },
    })

    if (!response.ok) {
      console.error('Failed to fetch user profile from Microsoft Graph:', response.status, response.statusText)
      return null
    }

    const userData = await response.json()

    return {
      id: userData.id || userData.employeeId,
      email: userData.mail || userData.userPrincipalName,
      displayName: userData.displayName,
      jobTitle: userData.jobTitle,
      department: userData.department,
    }
  } catch (error) {
    console.error('Error fetching user profile from Microsoft Graph:', error)
    return null
  }
}

/**
 * Gets the current authenticated user
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  // Mock authentication for development
  if (AUTH_MODE === 'mock') {
    return getMockUserProfile()
  }

  // Use QSoftware API by default, fallback to Microsoft
  if (AUTH_MODE === 'qsoftware' || QSoftware.isAuthenticated()) {
    const user = await fetchUserProfileFromQSoftware()
    if (user) return user
  }

  // Fallback to Microsoft authentication
  return await fetchUserProfileFromMicrosoft()
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
  const authModeLabel = AUTH_MODE === 'mock' ? 'MOCK' : AUTH_MODE === 'qsoftware' ? 'QSoftware' : 'Microsoft'
  console.log(`=== Starting ${authModeLabel} authentication ===`)

  if (AUTH_MODE === 'mock') {
    console.log(`⚠️  MOCK MODE ACTIVE - Using mock user profile: ${MOCK_USER_ROLE}`)
  }

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
  try {
    // Sign out from QSoftware if using QSoftware auth
    if (QSoftware.isAuthenticated()) {
      await QSoftware.logout()
      console.log('Signed out from QSoftware')
    }

    // Sign out from Microsoft
    const msal = await getMsalInstance()
    const accounts = msal.getAllAccounts()

    if (accounts.length > 0) {
      await msal.logoutPopup({
        account: accounts[0],
      })
    }

    // Remove token from localStorage
    deleteAccessToken()
    console.log('User signed out successfully')
  } catch (error) {
    console.error('Sign out error:', error)
    // Still delete tokens even if logout fails
    deleteAccessToken()
    QSoftware.clearTokens()
  }
}

/**
 * Login with Microsoft using OAuth redirect flow through QSoftware
 * This will redirect the user to Microsoft login via QSoftware backend
 */
export async function loginWithMicrosoft(): Promise<void> {
  console.log('Initiating Microsoft login with redirect...')

  // Skip login for mock mode
  if (AUTH_MODE === 'mock') {
    console.log('Mock mode: Skipping Microsoft login - user will be authenticated on next page load')
    return
  }

  if (AUTH_MODE === 'qsoftware') {
    // Use QSoftware OAuth flow (redirects to Microsoft, then back)
    QSoftware.initiateOAuthLogin()
  } else {
    // Fallback to MSAL redirect (no popup issues)
    await loginWithMicrosoftRedirect()
  }
}

/**
 * Login with Microsoft using MSAL redirect (Fallback method - no popup issues)
 */
async function loginWithMicrosoftRedirect(): Promise<void> {
  try {
    console.log('Starting Microsoft login with redirect...')
    const msal = await getMsalInstance()

    // Use redirect for login (works better than popup, no COOP issues)
    await msal.loginRedirect(loginRequest)
    // User will be redirected to Microsoft login, then back to the app
  } catch (error) {
    console.error('Microsoft login redirect error:', error)
    throw error
  }
}

/**
 * Handle redirect response after Microsoft login
 */
export async function handleRedirectResponse(): Promise<boolean> {
  try {
    const msal = await getMsalInstance()
    const response = await msal.handleRedirectPromise()

    if (response) {
      console.log('Microsoft redirect login successful:', response.account?.username)

      // If using QSoftware mode, authenticate with QSoftware using Microsoft token
      if (AUTH_MODE === 'qsoftware' && response.accessToken) {
        console.log('Authenticating with QSoftware API using Microsoft token...')
        const result = await QSoftware.loginWithMicrosoftSSO(response.accessToken)

        if (result.success) {
          console.log('QSoftware SSO authentication successful')
          return true
        } else {
          console.warn('QSoftware SSO failed, falling back to Microsoft auth:', result.message)
          // Continue with Microsoft auth even if QSoftware fails
          return true
        }
      }

      return true
    }

    return false
  } catch (error) {
    console.error('Error handling redirect response:', error)
    return false
  }
}

/**
 * Handle OAuth callback after redirect from QSoftware
 * Call this when the user returns from Microsoft login
 */
export async function handleOAuthCallback(): Promise<boolean> {
  try {
    console.log('Handling OAuth callback...')
    const result = QSoftware.handleOAuthCallback()

    if (result.success) {
      console.log('OAuth callback successful, tokens stored')
      return true
    } else {
      console.error('OAuth callback failed:', result.error)
      return false
    }
  } catch (error) {
    console.error('Error handling OAuth callback:', error)
    return false
  }
}

/**
 * Check if user is already logged in
 */
export async function checkExistingSession(): Promise<boolean> {
  try {
    // Mock mode always has a session
    if (AUTH_MODE === 'mock') {
      console.log('Mock mode: Session active')
      return true
    }

    // First check QSoftware session
    if (QSoftware.isAuthenticated()) {
      const user = await QSoftware.getCurrentUserProfile()
      if (user) {
        console.log('QSoftware session found for:', user.email)
        return true
      }
    }

    // Fallback to MSAL session
    const msal = await getMsalInstance()
    const accounts = msal.getAllAccounts()
    if (accounts && accounts.length > 0) {
      console.log('Microsoft session found for:', accounts[0]?.username)
      return true
    }

    return false
  } catch (error) {
    console.error('Error checking existing session:', error)
    return false
  }
}

/**
 * Login with email and password (QSoftware)
 */
export async function loginWithCredentials(email: string, password: string): Promise<boolean> {
  try {
    console.log('Starting QSoftware login with credentials...')
    const result = await QSoftware.loginWithCredentials(email, password)

    if (result.success) {
      console.log('QSoftware login successful:', result.user?.email)
      return true
    } else {
      console.error('QSoftware login failed:', result.message)
      return false
    }
  } catch (error) {
    console.error('Credentials login error:', error)
    return false
  }
}

/**
 * Helper function to get access token for API calls
 */
export async function getAccessToken(): Promise<string | null> {
  // First try to get QSoftware token
  const qsoftwareToken = QSoftware.getStoredToken()
  if (qsoftwareToken) {
    return qsoftwareToken
  }

  // Fallback to stored access token
  return getStoredAccessToken()
}
