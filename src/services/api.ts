import axios, { type AxiosInstance } from 'axios'
import type {
  PerformanceData,
  PerformanceFilters,
  FilterOptions,
  ActionLog,
  MonthlySummaryResponse,
  ClientSummaryData,
  AgentWarning
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Request interceptor for adding auth tokens
apiClient.interceptors.request.use(
  async (config) => {
    // Get access token from auth service
    const { getAccessToken } = await import('./authService')
    const token = await getAccessToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh the token using QSoftware service
        const QSoftware = await import('./qsoftwareService')
        const refreshToken = QSoftware.getStoredRefreshToken()

        if (refreshToken) {
          const newToken = await QSoftware.refreshAccessToken(refreshToken)
          if (newToken) {
            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return apiClient(originalRequest)
          }
        }

        // If refresh failed, redirect to login
        console.error('Token refresh failed. User needs to login again.')
        // You can emit an event here to trigger logout
        window.dispatchEvent(new CustomEvent('auth:session-expired'))
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError)
      }
    }

    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default apiClient

// Helper function to build query params
function buildQueryParams(filters?: PerformanceFilters): string {
  if (!filters) return ''

  const params = new URLSearchParams()
  if (filters.month) params.append('month', filters.month)
  if (filters.year) params.append('year', filters.year)
  if (filters.category) params.append('category', filters.category)
  if (filters.client) params.append('client', filters.client)
  if (filters.task) params.append('task', filters.task)

  const queryString = params.toString()
  return queryString ? `?${queryString}` : ''
}

// Performance Data API
export async function fetchPerformanceData(filters?: PerformanceFilters): Promise<PerformanceData[]> {
  const queryString = buildQueryParams(filters)
  // Updated path to match NestJS backend
  const response = await apiClient.get<PerformanceData[]>(`/api/performance/data${queryString}`)
  return response.data
}

// Monthly Summary API
export async function fetchMonthlySummary(filters?: PerformanceFilters): Promise<MonthlySummaryResponse> {
  const queryString = buildQueryParams(filters)
  // Updated path to match NestJS backend
  const response = await apiClient.get<MonthlySummaryResponse>(`/api/performance/monthly-summary${queryString}`)
  return response.data
}

// Filters API
export async function fetchFilters(cascadingFilters?: {
  client?: string
  category?: string
  month?: string
  year?: string
}): Promise<FilterOptions> {
  const params = new URLSearchParams()
  if (cascadingFilters?.client) params.append('client', cascadingFilters.client)
  if (cascadingFilters?.category) params.append('category', cascadingFilters.category)
  if (cascadingFilters?.month) params.append('month', cascadingFilters.month)
  if (cascadingFilters?.year) params.append('year', cascadingFilters.year)

  const queryString = params.toString()
  // Updated path to match NestJS backend
  const response = await apiClient.get<FilterOptions>(`/api/performance/filters${queryString ? '?' + queryString : ''}`)
  return response.data
}

// Action Log API
export async function fetchActionLog(): Promise<ActionLog[]> {
  const response = await apiClient.get<ActionLog[]>('/api/action-log')
  return response.data
}

export async function createAction(action: Omit<ActionLog, 'id'>): Promise<{ success: boolean; id: number }> {
  const response = await apiClient.post<{ success: boolean; id: number }>('/api/action-log', action)
  return response.data
}

export async function checkDuplicateAction(
  agentEmail: string,
  weekStartDate: Date,
  weekEndDate: Date
): Promise<{ exists: boolean; action?: any }> {
  const response = await apiClient.post<{ exists: boolean; action?: any }>('/api/action-log/check-duplicate', {
    agentEmail,
    weekStartDate: weekStartDate.toISOString().split('T')[0],
    weekEndDate: weekEndDate.toISOString().split('T')[0],
  })
  return response.data
}

export async function deleteAction(actionId: number): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.delete<{ success: boolean; message: string }>(`/api/action-log/${actionId}`)
  return response.data
}

// Client Summary API
export async function fetchClientSummary(filters?: { month?: string; year?: string }): Promise<ClientSummaryData[]> {
  const params = new URLSearchParams()
  if (filters?.month) params.append('month', filters.month)
  if (filters?.year) params.append('year', filters.year)

  const queryString = params.toString()
  // Updated path to match NestJS backend
  const response = await apiClient.get<ClientSummaryData[]>(`/api/performance/client-summary${queryString ? '?' + queryString : ''}`)
  return response.data
}

// Agent Warnings API
export async function fetchAgentWarnings(agentEmail: string): Promise<AgentWarning[]> {
  try {
    const response = await apiClient.get<AgentWarning[]>(`/api/warnings/${agentEmail}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching warnings for ${agentEmail}:`, error)
    return []
  }
}

// Transformation & Utility Functions
export function groupByWeek(data: PerformanceData[]): Map<string, Map<string, PerformanceData[]>> {
  const grouped = new Map<string, Map<string, PerformanceData[]>>()

  data.forEach(item => {
    const key = `${item.agent_email}`
    if (!grouped.has(key)) {
      grouped.set(key, new Map())
    }

    const agentData = grouped.get(key)!
    if (!agentData.has(item.week_range)) {
      agentData.set(item.week_range, [])
    }
    agentData.get(item.week_range)!.push(item)
  })

  return grouped
}

export function calculateAgentMonthlyResults(
  agentWeeksData: Map<string, PerformanceData[]>,
  agentEmail: string,
  actionLog: ActionLog[] = []
): { compliantWeeks: number; totalWeeks: number; actionCount: number } {
  let compliantWeeks = 0
  const totalWeeks = agentWeeksData.size

  agentWeeksData.forEach(recordsInWeek => {
    const isCompliant = !recordsInWeek.some(
      d => d.flag_qa === 'Critical' || d.flag_qa === 'Low' || d.flag_prod === 'Critical' || d.flag_prod === 'Low'
    )
    if (isCompliant) {
      compliantWeeks++
    }
  })

  const actionCount = actionLog.filter(action => action.agent_email === agentEmail).length

  return {
    compliantWeeks,
    totalWeeks,
    actionCount,
  }
}

export function generateRecommendation(
  results: { compliantWeeks: number; totalWeeks: number; actionCount: number },
  hasVerbalWarning: boolean = false,
  hasWrittenWarning: boolean = false
): {
  action: string;
  isCritical: boolean;
  notes: string;
} {
  const nonCompliantWeeks = results.totalWeeks - results.compliantWeeks

  // Case A: 4 consecutive weeks underperforming, no previous actions
  if (nonCompliantWeeks >= 4 && results.actionCount === 0) {
    return {
      action: 'Verbal Warning',
      isCritical: true,
      notes: 'Agent has 4 consecutive weeks underperforming with no prior actions taken. Immediate verbal warning required.',
    }
  }

  // Case B: 4 consecutive weeks underperforming, has verbal warning
  if (nonCompliantWeeks >= 4 && hasVerbalWarning && !hasWrittenWarning) {
    return {
      action: 'Written Warning',
      isCritical: true,
      notes: 'Agent has 4 consecutive weeks underperforming after verbal warning. Escalate to written warning.',
    }
  }

  // Case C: 4 consecutive weeks underperforming, has written warning
  if (nonCompliantWeeks >= 4 && hasWrittenWarning) {
    return {
      action: 'Performance Improvement Plan (PIP) or Termination',
      isCritical: true,
      notes: 'Agent has 4 consecutive weeks underperforming after written warning. Consider PIP or termination.',
    }
  }

  // Case D: Leadership accountability - no action taken when required
  if (nonCompliantWeeks >= 4 && results.actionCount === 0) {
    return {
      action: 'Notify Leadership',
      isCritical: true,
      notes: 'Leadership has not taken action for agent with 4+ weeks underperforming. Escalate to Director/AVP.',
    }
  }

  // Case E: Monitoring - some underperformance but not critical yet
  if (nonCompliantWeeks >= 2 && nonCompliantWeeks < 4) {
    return {
      action: 'Monitor Closely',
      isCritical: false,
      notes: 'Agent showing signs of underperformance. Continue monitoring and provide coaching.',
    }
  }

  // No action needed
  if (nonCompliantWeeks === 0) {
    return {
      action: 'No Action Required',
      isCritical: false,
      notes: 'Agent performance is within acceptable range.',
    }
  }

  // Minimal issues
  if (nonCompliantWeeks === 1) {
    return {
      action: 'Coaching',
      isCritical: false,
      notes: 'One non-compliant week detected. Provide focused coaching.',
    }
  }

  return {
    action: 'Review Required',
    isCritical: true,
    notes: 'Performance pattern does not fit standard cases. Requires manual review by leadership.',
  }
}
