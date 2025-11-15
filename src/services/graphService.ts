// Microsoft Graph API Service
// Provides user hierarchy, organizational data, and role information
import { msalConfig, loginRequest } from '../config/authConfig'
import { PublicClientApplication } from '@azure/msal-browser'
import { acquireTokenWithLock } from './tokenManager'

// Check if we're in mock mode
const IS_MOCK_MODE = import.meta.env.VITE_AUTH_MODE === 'mock'

// Initialize MSAL instance only if not in mock mode
let msalInstance: PublicClientApplication | null = null

function getMsalInstance(): PublicClientApplication {
  if (!msalInstance && !IS_MOCK_MODE) {
    msalInstance = new PublicClientApplication(msalConfig)
  }
  return msalInstance!
}

/**
 * Microsoft Graph API endpoints
 */
const GRAPH_ENDPOINTS = {
  me: 'https://graph.microsoft.com/v1.0/me',
  manager: 'https://graph.microsoft.com/v1.0/me/manager',
  directReports: 'https://graph.microsoft.com/v1.0/me/directReports',
  memberOf: 'https://graph.microsoft.com/v1.0/me/memberOf',
  users: 'https://graph.microsoft.com/v1.0/users',
  organization: 'https://graph.microsoft.com/v1.0/organization',
}

/**
 * Extended user profile from Microsoft Graph
 */
export interface GraphUserProfile {
  id: string
  displayName: string
  givenName: string
  surname: string
  mail: string
  userPrincipalName: string
  jobTitle?: string
  department?: string
  officeLocation?: string
  mobilePhone?: string
  businessPhones?: string[]
  employeeId?: string
  companyName?: string
}

/**
 * Manager information from Graph API
 */
export interface GraphManager {
  id: string
  displayName: string
  mail: string
  jobTitle?: string
  department?: string
}

/**
 * Direct report information
 */
export interface GraphDirectReport {
  id: string
  displayName: string
  mail: string
  jobTitle?: string
  department?: string
}

/**
 * Group membership information
 */
export interface GraphGroup {
  id: string
  displayName: string
  description?: string
  mail?: string
}

/**
 * Organizational hierarchy data
 */
export interface OrganizationalHierarchy {
  user: GraphUserProfile
  manager?: GraphManager
  directReports: GraphDirectReport[]
  groups: GraphGroup[]
}

/**
 * Get access token for Microsoft Graph API
 */
async function getGraphAccessToken(): Promise<string> {
  if (IS_MOCK_MODE) {
    // Return mock token in mock mode
    return 'mock-graph-token'
  }

  try {
    const instance = getMsalInstance()
    await instance.initialize()

    const accounts = instance.getAllAccounts()
    if (accounts.length === 0) {
      throw new Error('No accounts found. Please sign in first.')
    }

    const request = {
      ...loginRequest,
      scopes: ['User.Read', 'User.ReadBasic.All', 'Directory.Read.All'],
      account: accounts[0],
    }

    const response = await instance.acquireTokenSilent(request)
    return response.accessToken
  } catch (error) {
    console.error('Error acquiring Graph API token:', error)

    // If silent token acquisition fails, try interactive with lock to prevent concurrent popups
    return await acquireTokenWithLock(async () => {
      try {
        const instance = getMsalInstance()
        const response = await instance.acquireTokenPopup({
          ...loginRequest,
          scopes: ['User.Read', 'User.ReadBasic.All', 'Directory.Read.All'],
        })
        return response.accessToken
      } catch (interactiveError) {
        console.error('Error acquiring token interactively:', interactiveError)
        throw new Error('Failed to acquire access token for Microsoft Graph')
      }
    })
  }
}

/**
 * Make authenticated request to Microsoft Graph API
 */
async function graphApiRequest<T>(endpoint: string): Promise<T> {
  if (IS_MOCK_MODE) {
    // Return empty mock data in mock mode
    console.log('🎭 Mock mode: Skipping Graph API request to', endpoint)
    return {} as T
  }

  try {
    const token = await getGraphAccessToken()

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Graph API request failed: ${response.status} ${response.statusText}`, errorText)
      throw new Error(`Graph API request failed: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Graph API request error:', error)
    throw error
  }
}

/**
 * Get current user's profile from Microsoft Graph
 */
export async function getUserProfile(): Promise<GraphUserProfile> {
  if (IS_MOCK_MODE) {
    return {
      id: 'mock-user-id',
      displayName: 'Mock Director',
      givenName: 'Mock',
      surname: 'Director',
      mail: 'mock.director@onqoc.com',
      userPrincipalName: 'mock.director@onqoc.com',
      jobTitle: 'Director',
      department: 'Development Team',
    }
  }
  return await graphApiRequest<GraphUserProfile>(GRAPH_ENDPOINTS.me)
}

/**
 * Get user's manager from Microsoft Graph
 */
export async function getUserManager(): Promise<GraphManager | null> {
  if (IS_MOCK_MODE) {
    return null // Mock director has no manager
  }
  try {
    return await graphApiRequest<GraphManager>(GRAPH_ENDPOINTS.manager)
  } catch (error) {
    // User might not have a manager assigned
    console.warn('Could not retrieve manager:', error)
    return null
  }
}

/**
 * Get user's direct reports from Microsoft Graph
 */
export async function getUserDirectReports(): Promise<GraphDirectReport[]> {
  if (IS_MOCK_MODE) {
    return [] // Mock data - no direct reports in Graph
  }
  try {
    const response = await graphApiRequest<{ value: GraphDirectReport[] }>(
      GRAPH_ENDPOINTS.directReports
    )
    return response.value || []
  } catch (error) {
    console.warn('Could not retrieve direct reports:', error)
    return []
  }
}

/**
 * Get user's group memberships from Microsoft Graph
 */
export async function getUserGroups(): Promise<GraphGroup[]> {
  if (IS_MOCK_MODE) {
    return [] // Mock data - no groups
  }
  try {
    const response = await graphApiRequest<{ value: GraphGroup[] }>(
      GRAPH_ENDPOINTS.memberOf
    )
    return response.value || []
  } catch (error) {
    console.warn('Could not retrieve group memberships:', error)
    return []
  }
}

/**
 * Get complete organizational hierarchy for current user
 */
export async function getOrganizationalHierarchy(): Promise<OrganizationalHierarchy> {
  try {
    const [user, manager, directReports, groups] = await Promise.all([
      getUserProfile(),
      getUserManager(),
      getUserDirectReports(),
      getUserGroups(),
    ])

    return {
      user,
      manager: manager || undefined,
      directReports,
      groups,
    }
  } catch (error) {
    console.error('Error fetching organizational hierarchy:', error)
    throw error
  }
}

/**
 * Get user profile by email
 */
export async function getUserByEmail(email: string): Promise<GraphUserProfile | null> {
  try {
    const endpoint = `${GRAPH_ENDPOINTS.users}/${email}`
    return await graphApiRequest<GraphUserProfile>(endpoint)
  } catch (error) {
    console.error(`Error fetching user by email ${email}:`, error)
    return null
  }
}

/**
 * Get direct reports for a specific user by email
 */
export async function getDirectReportsByEmail(email: string): Promise<GraphDirectReport[]> {
  try {
    const endpoint = `${GRAPH_ENDPOINTS.users}/${email}/directReports`
    const response = await graphApiRequest<{ value: GraphDirectReport[] }>(endpoint)
    return response.value || []
  } catch (error) {
    console.warn(`Could not retrieve direct reports for ${email}:`, error)
    return []
  }
}

/**
 * Check if user is in a specific Azure AD group
 */
export function isUserInGroup(groups: GraphGroup[], groupName: string): boolean {
  return groups.some(
    (group) =>
      group.displayName.toLowerCase() === groupName.toLowerCase() ||
      group.description?.toLowerCase().includes(groupName.toLowerCase())
  )
}

/**
 * Get all team members recursively (user + all direct reports)
 */
export async function getAllTeamMembers(userEmail?: string): Promise<GraphDirectReport[]> {
  try {
    const directReports = userEmail
      ? await getDirectReportsByEmail(userEmail)
      : await getUserDirectReports()

    const allMembers: GraphDirectReport[] = [...directReports]

    // Recursively get direct reports for each team member
    for (const report of directReports) {
      if (report.mail) {
        const subReports = await getDirectReportsByEmail(report.mail)
        allMembers.push(...subReports)
      }
    }

    return allMembers
  } catch (error) {
    console.error('Error fetching all team members:', error)
    return []
  }
}

/**
 * Get reporting chain (all managers up to top level)
 */
export async function getReportingChain(): Promise<GraphManager[]> {
  const chain: GraphManager[] = []

  try {
    let currentManager = await getUserManager()

    while (currentManager) {
      chain.push(currentManager)

      // Get manager's manager
      try {
        currentManager = await graphApiRequest<GraphManager>(
          `${GRAPH_ENDPOINTS.users}/${currentManager.mail}/manager`
        )
      } catch {
        // No more managers in the chain
        currentManager = null
      }
    }
  } catch (error) {
    console.error('Error fetching reporting chain:', error)
  }

  return chain
}
