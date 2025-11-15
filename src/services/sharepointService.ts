// SharePoint API Service
// Connects to SharePoint headcount list for dynamic role verification and team assignments
import { msalConfig } from '../config/authConfig'
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
 * SharePoint configuration from environment variables
 */
const SHAREPOINT_CONFIG = {
  siteUrl: import.meta.env.VITE_SHAREPOINT_SITE_URL || '',
  listName: import.meta.env.VITE_SHAREPOINT_HEADCOUNT_LIST || 'Headcount',
  clientsListName: import.meta.env.VITE_SHAREPOINT_CLIENTS_LIST || 'ClientAssignments',
}

/**
 * Employee data from SharePoint headcount list
 */
export interface SharePointEmployee {
  id: string
  email: string
  displayName: string
  firstName?: string
  lastName?: string
  employeeId?: string
  jobTitle: string
  department?: string
  position?: string
  office?: string
  client?: string
  supervisor?: string
  supervisorEmail?: string
  manager?: string
  managerEmail?: string
  hireDate?: string
  status?: 'Active' | 'Inactive' | 'On Leave'
  team?: string
  category?: string
}

/**
 * Client assignment data from SharePoint
 */
export interface ClientAssignment {
  id: string
  client: string
  category: string
  supervisor: string
  supervisorEmail: string
  manager: string
  managerEmail: string
  director?: string
  directorEmail?: string
}

/**
 * Team hierarchy structure
 */
export interface TeamHierarchy {
  supervisorEmail: string
  supervisorName: string
  managerEmail: string
  managerName: string
  directorEmail?: string
  directorName?: string
  client: string
  category: string
  teamMembers: SharePointEmployee[]
}

/**
 * Get access token for SharePoint API
 */
async function getSharePointAccessToken(): Promise<string> {
  if (IS_MOCK_MODE) {
    // Return mock token in mock mode
    return 'mock-sharepoint-token'
  }

  try {
    const instance = getMsalInstance()
    await instance.initialize()

    const accounts = instance.getAllAccounts()
    if (accounts.length === 0) {
      throw new Error('No accounts found. Please sign in first.')
    }

    // Extract SharePoint site domain from URL
    const siteUrl = new URL(SHAREPOINT_CONFIG.siteUrl)
    const sharePointScope = `https://${siteUrl.hostname}/.default`

    const request = {
      scopes: [sharePointScope, 'Sites.Read.All', 'Sites.ReadWrite.All'],
      account: accounts[0],
    }

    const response = await instance.acquireTokenSilent(request)
    return response.accessToken
  } catch (error) {
    console.error('Error acquiring SharePoint token:', error)

    // If silent token acquisition fails, try interactive with lock to prevent concurrent popups
    return await acquireTokenWithLock(async () => {
      try {
        const instance = getMsalInstance()
        const siteUrl = new URL(SHAREPOINT_CONFIG.siteUrl)
        const sharePointScope = `https://${siteUrl.hostname}/.default`

        const response = await instance.acquireTokenPopup({
          scopes: [sharePointScope, 'Sites.Read.All'],
        })
        return response.accessToken
      } catch (interactiveError) {
        console.error('Error acquiring SharePoint token interactively:', interactiveError)
        throw new Error('Failed to acquire access token for SharePoint')
      }
    })
  }
}

/**
 * Make authenticated request to SharePoint REST API
 */
async function sharePointRequest<T>(endpoint: string): Promise<T> {
  if (IS_MOCK_MODE) {
    // Return empty mock data in mock mode
    console.log('🎭 Mock mode: Skipping SharePoint API request to', endpoint)
    return { results: [] } as T
  }

  try {
    const token = await getSharePointAccessToken()

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json;odata=verbose',
        'Content-Type': 'application/json;odata=verbose',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(
        `SharePoint API request failed: ${response.status} ${response.statusText}`,
        errorText
      )
      throw new Error(`SharePoint API request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.d || data
  } catch (error) {
    console.error('SharePoint API request error:', error)
    throw error
  }
}

/**
 * Get all employees from SharePoint headcount list
 */
export async function getAllEmployees(): Promise<SharePointEmployee[]> {
  if (IS_MOCK_MODE) {
    // Return mock employees for director role
    return [
      {
        id: '1',
        email: 'manager1@onqoc.com',
        displayName: 'John Manager',
        jobTitle: 'Manager',
        department: 'Development Team',
        supervisorEmail: 'mock.director@onqoc.com',
        status: 'Active',
      },
      {
        id: '2',
        email: 'agent1@onqoc.com',
        displayName: 'Jane Agent',
        jobTitle: 'Customer Service Agent',
        department: 'Development Team',
        supervisorEmail: 'manager1@onqoc.com',
        status: 'Active',
      },
    ]
  }

  try {
    const endpoint = `${SHAREPOINT_CONFIG.siteUrl}/_api/web/lists/getbytitle('${SHAREPOINT_CONFIG.listName}')/items?$top=5000&$filter=Status eq 'Active'`

    const response = await sharePointRequest<{ results: any[] }>(endpoint)

    return response.results.map((item: any) => ({
      id: item.Id?.toString() || item.ID?.toString(),
      email: item.Email || item.WorkEmail,
      displayName: item.Title || item.FullName,
      firstName: item.FirstName,
      lastName: item.LastName,
      employeeId: item.EmployeeID || item.EmployeeNumber,
      jobTitle: item.JobTitle || item.Position,
      department: item.Department,
      position: item.Position,
      office: item.Office || item.Location,
      client: item.Client,
      supervisor: item.Supervisor,
      supervisorEmail: item.SupervisorEmail,
      manager: item.Manager,
      managerEmail: item.ManagerEmail,
      hireDate: item.HireDate,
      status: item.Status || 'Active',
      team: item.Team,
      category: item.Category,
    }))
  } catch (error) {
    console.error('Error fetching employees from SharePoint:', error)
    return []
  }
}

/**
 * Get employee by email from SharePoint
 */
export async function getEmployeeByEmail(email: string): Promise<SharePointEmployee | null> {
  if (IS_MOCK_MODE) {
    // Return mock employee data based on email
    if (email === 'mock.director@onqoc.com') {
      return {
        id: 'mock-director-001',
        email: 'mock.director@onqoc.com',
        displayName: 'Mock Director',
        jobTitle: 'Director',
        department: 'Development Team',
        status: 'Active',
      }
    }
    return null
  }

  try {
    const endpoint = `${SHAREPOINT_CONFIG.siteUrl}/_api/web/lists/getbytitle('${SHAREPOINT_CONFIG.listName}')/items?$filter=Email eq '${email}' or WorkEmail eq '${email}'`

    const response = await sharePointRequest<{ results: any[] }>(endpoint)

    if (response.results.length === 0) {
      console.warn(`No employee found with email: ${email}`)
      return null
    }

    const item = response.results[0]
    return {
      id: item.Id?.toString() || item.ID?.toString(),
      email: item.Email || item.WorkEmail,
      displayName: item.Title || item.FullName,
      firstName: item.FirstName,
      lastName: item.LastName,
      employeeId: item.EmployeeID || item.EmployeeNumber,
      jobTitle: item.JobTitle || item.Position,
      department: item.Department,
      position: item.Position,
      office: item.Office || item.Location,
      client: item.Client,
      supervisor: item.Supervisor,
      supervisorEmail: item.SupervisorEmail,
      manager: item.Manager,
      managerEmail: item.ManagerEmail,
      hireDate: item.HireDate,
      status: item.Status || 'Active',
      team: item.Team,
      category: item.Category,
    }
  } catch (error) {
    console.error(`Error fetching employee by email ${email}:`, error)
    return null
  }
}

/**
 * Get all client assignments from SharePoint
 */
export async function getClientAssignments(): Promise<ClientAssignment[]> {
  if (IS_MOCK_MODE) {
    // Return mock client assignments
    return [
      {
        id: '1',
        client: 'Mock Client A',
        category: 'Premium',
        supervisor: 'John Supervisor',
        supervisorEmail: 'supervisor@onqoc.com',
        manager: 'Jane Manager',
        managerEmail: 'manager@onqoc.com',
        director: 'Mock Director',
        directorEmail: 'mock.director@onqoc.com',
      },
      {
        id: '2',
        client: 'Mock Client B',
        category: 'Standard',
        supervisor: 'John Supervisor',
        supervisorEmail: 'supervisor@onqoc.com',
        manager: 'Jane Manager',
        managerEmail: 'manager@onqoc.com',
        director: 'Mock Director',
        directorEmail: 'mock.director@onqoc.com',
      },
    ]
  }

  try {
    const endpoint = `${SHAREPOINT_CONFIG.siteUrl}/_api/web/lists/getbytitle('${SHAREPOINT_CONFIG.clientsListName}')/items?$top=5000`

    const response = await sharePointRequest<{ results: any[] }>(endpoint)

    return response.results.map((item: any) => ({
      id: item.Id?.toString() || item.ID?.toString(),
      client: item.Client || item.ClientName,
      category: item.Category,
      supervisor: item.Supervisor,
      supervisorEmail: item.SupervisorEmail,
      manager: item.Manager,
      managerEmail: item.ManagerEmail,
      director: item.Director,
      directorEmail: item.DirectorEmail,
    }))
  } catch (error) {
    console.error('Error fetching client assignments from SharePoint:', error)
    return []
  }
}

/**
 * Get team members for a supervisor
 */
export async function getTeamMembersBySupervisor(
  supervisorEmail: string
): Promise<SharePointEmployee[]> {
  try {
    const endpoint = `${SHAREPOINT_CONFIG.siteUrl}/_api/web/lists/getbytitle('${SHAREPOINT_CONFIG.listName}')/items?$filter=SupervisorEmail eq '${supervisorEmail}' and Status eq 'Active'&$top=5000`

    const response = await sharePointRequest<{ results: any[] }>(endpoint)

    return response.results.map((item: any) => ({
      id: item.Id?.toString() || item.ID?.toString(),
      email: item.Email || item.WorkEmail,
      displayName: item.Title || item.FullName,
      firstName: item.FirstName,
      lastName: item.LastName,
      employeeId: item.EmployeeID || item.EmployeeNumber,
      jobTitle: item.JobTitle || item.Position,
      department: item.Department,
      position: item.Position,
      office: item.Office || item.Location,
      client: item.Client,
      supervisor: item.Supervisor,
      supervisorEmail: item.SupervisorEmail,
      manager: item.Manager,
      managerEmail: item.ManagerEmail,
      hireDate: item.HireDate,
      status: item.Status || 'Active',
      team: item.Team,
      category: item.Category,
    }))
  } catch (error) {
    console.error(`Error fetching team members for supervisor ${supervisorEmail}:`, error)
    return []
  }
}

/**
 * Get all team members for a manager (including indirect reports)
 */
export async function getTeamMembersByManager(managerEmail: string): Promise<SharePointEmployee[]> {
  try {
    const endpoint = `${SHAREPOINT_CONFIG.siteUrl}/_api/web/lists/getbytitle('${SHAREPOINT_CONFIG.listName}')/items?$filter=ManagerEmail eq '${managerEmail}' and Status eq 'Active'&$top=5000`

    const response = await sharePointRequest<{ results: any[] }>(endpoint)

    return response.results.map((item: any) => ({
      id: item.Id?.toString() || item.ID?.toString(),
      email: item.Email || item.WorkEmail,
      displayName: item.Title || item.FullName,
      firstName: item.FirstName,
      lastName: item.LastName,
      employeeId: item.EmployeeID || item.EmployeeNumber,
      jobTitle: item.JobTitle || item.Position,
      department: item.Department,
      position: item.Position,
      office: item.Office || item.Location,
      client: item.Client,
      supervisor: item.Supervisor,
      supervisorEmail: item.SupervisorEmail,
      manager: item.Manager,
      managerEmail: item.ManagerEmail,
      hireDate: item.HireDate,
      status: item.Status || 'Active',
      team: item.Team,
      category: item.Category,
    }))
  } catch (error) {
    console.error(`Error fetching team members for manager ${managerEmail}:`, error)
    return []
  }
}

/**
 * Get clients assigned to a user based on their role
 */
export async function getAssignedClients(userEmail: string): Promise<string[]> {
  if (IS_MOCK_MODE) {
    // Return all mock clients for director
    return ['Mock Client A', 'Mock Client B']
  }

  try {
    const clientAssignments = await getClientAssignments()

    const assignedClients = clientAssignments
      .filter(
        (assignment) =>
          assignment.supervisorEmail?.toLowerCase() === userEmail.toLowerCase() ||
          assignment.managerEmail?.toLowerCase() === userEmail.toLowerCase() ||
          assignment.directorEmail?.toLowerCase() === userEmail.toLowerCase()
      )
      .map((assignment) => assignment.client)

    return [...new Set(assignedClients)] // Remove duplicates
  } catch (error) {
    console.error(`Error fetching assigned clients for ${userEmail}:`, error)
    return []
  }
}

/**
 * Get complete team hierarchy for a user
 */
export async function getTeamHierarchy(userEmail: string): Promise<TeamHierarchy[]> {
  try {
    const [employee, clientAssignments] = await Promise.all([
      getEmployeeByEmail(userEmail),
      getClientAssignments(),
    ])

    if (!employee) {
      return []
    }

    // Find client assignments where user is supervisor, manager, or director
    const userAssignments = clientAssignments.filter(
      (assignment) =>
        assignment.supervisorEmail?.toLowerCase() === userEmail.toLowerCase() ||
        assignment.managerEmail?.toLowerCase() === userEmail.toLowerCase() ||
        assignment.directorEmail?.toLowerCase() === userEmail.toLowerCase()
    )

    const hierarchies: TeamHierarchy[] = []

    for (const assignment of userAssignments) {
      const teamMembers = await getTeamMembersBySupervisor(assignment.supervisorEmail)

      hierarchies.push({
        supervisorEmail: assignment.supervisorEmail,
        supervisorName: assignment.supervisor,
        managerEmail: assignment.managerEmail,
        managerName: assignment.manager,
        directorEmail: assignment.directorEmail,
        directorName: assignment.director,
        client: assignment.client,
        category: assignment.category,
        teamMembers,
      })
    }

    return hierarchies
  } catch (error) {
    console.error(`Error fetching team hierarchy for ${userEmail}:`, error)
    return []
  }
}

/**
 * Verify if user has access to a specific client
 */
export async function verifyClientAccess(
  userEmail: string,
  client: string
): Promise<boolean> {
  try {
    const assignedClients = await getAssignedClients(userEmail)
    return assignedClients.some((c) => c.toLowerCase() === client.toLowerCase())
  } catch (error) {
    console.error(`Error verifying client access for ${userEmail}:`, error)
    return false
  }
}

/**
 * Get all employees under a user's supervision (recursive)
 */
export async function getAllSubordinates(userEmail: string): Promise<SharePointEmployee[]> {
  if (IS_MOCK_MODE) {
    // Return mock team members for director
    return [
      {
        id: '1',
        email: 'manager1@onqoc.com',
        displayName: 'John Manager',
        jobTitle: 'Manager',
        department: 'Development Team',
        supervisorEmail: 'mock.director@onqoc.com',
        status: 'Active',
      },
      {
        id: '2',
        email: 'agent1@onqoc.com',
        displayName: 'Jane Agent',
        jobTitle: 'Customer Service Agent',
        department: 'Development Team',
        supervisorEmail: 'manager1@onqoc.com',
        managerEmail: 'mock.director@onqoc.com',
        status: 'Active',
      },
      {
        id: '3',
        email: 'agent2@onqoc.com',
        displayName: 'Bob Agent',
        jobTitle: 'Customer Service Agent',
        department: 'Development Team',
        supervisorEmail: 'manager1@onqoc.com',
        managerEmail: 'mock.director@onqoc.com',
        status: 'Active',
      },
    ]
  }

  try {
    const allEmployees = await getAllEmployees()

    const subordinates: SharePointEmployee[] = []
    const processedEmails = new Set<string>()

    async function findSubordinates(supervisorEmail: string) {
      if (processedEmails.has(supervisorEmail.toLowerCase())) {
        return
      }

      processedEmails.add(supervisorEmail.toLowerCase())

      const directReports = allEmployees.filter(
        (emp) =>
          emp.supervisorEmail?.toLowerCase() === supervisorEmail.toLowerCase() ||
          emp.managerEmail?.toLowerCase() === supervisorEmail.toLowerCase()
      )

      for (const report of directReports) {
        if (!subordinates.some((s) => s.email?.toLowerCase() === report.email?.toLowerCase())) {
          subordinates.push(report)
        }

        // Recursively find their reports
        if (report.email) {
          await findSubordinates(report.email)
        }
      }
    }

    await findSubordinates(userEmail)

    return subordinates
  } catch (error) {
    console.error(`Error fetching all subordinates for ${userEmail}:`, error)
    return []
  }
}
