// Warning System Business Logic
// Handles warning tracking, expiration, and progression validation

import type { ActionLog } from '@/types'

export type WarningType = 'Verbal Warning' | 'Written Warning' | 'Final Warning' | 'PIP' | 'Termination'
export type WarningCategory = 'Substandard Work - Production' | 'Substandard Work - QA' | 'Other'

export interface WarningConfig {
  type: WarningType
  expirationDays: number
  progressionOrder: number
}

// Warning configuration based on OnQ standards
export const WARNING_CONFIGS: Record<WarningType, WarningConfig> = {
  'Verbal Warning': {
    type: 'Verbal Warning',
    expirationDays: 90, // 3 months
    progressionOrder: 1
  },
  'Written Warning': {
    type: 'Written Warning',
    expirationDays: 180, // 6 months
    progressionOrder: 2
  },
  'Final Warning': {
    type: 'Final Warning',
    expirationDays: 365, // 12 months
    progressionOrder: 3
  },
  'PIP': {
    type: 'PIP',
    expirationDays: 90, // 3 months
    progressionOrder: 3
  },
  'Termination': {
    type: 'Termination',
    expirationDays: 0, // Permanent
    progressionOrder: 4
  }
}

/**
 * Calculate expiration date for a warning
 */
export function calculateExpirationDate(warningType: WarningType, issueDate: Date): Date | null {
  const config = WARNING_CONFIGS[warningType]
  if (!config || config.expirationDays === 0) {
    return null // Permanent (Termination)
  }

  const expirationDate = new Date(issueDate)
  expirationDate.setDate(expirationDate.getDate() + config.expirationDays)
  return expirationDate
}

/**
 * Check if a warning is currently active (not expired and is_active = true)
 */
export function isWarningActive(warning: ActionLog): boolean {
  if (warning.is_active === false) {
    return false
  }

  if (!warning.expiration_date) {
    return true // Permanent warnings (like Termination) are always active
  }

  const expirationDate = new Date(warning.expiration_date)
  const today = new Date()
  return expirationDate > today
}

/**
 * Get days until expiration
 */
export function getDaysUntilExpiration(expirationDate: string): number {
  const expDate = new Date(expirationDate)
  const today = new Date()
  return Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Get active warnings for an agent by category
 */
export function getActiveWarnings(
  agentEmail: string,
  allActions: ActionLog[],
  category?: WarningCategory
): ActionLog[] {
  return allActions.filter(action => {
    if (action.agent_email !== agentEmail) return false
    if (!action.warning_type) return false
    if (category && action.warning_type !== category) return false
    return isWarningActive(action)
  })
}

/**
 * Get active warnings by type for an agent
 */
export function getActiveWarningsByType(
  agentEmail: string,
  warningType: WarningType,
  category: WarningCategory,
  allActions: ActionLog[]
): ActionLog[] {
  return allActions.filter(action => {
    if (action.agent_email !== agentEmail) return false
    if (action.action_type !== warningType) return false
    if (action.warning_type !== category) return false
    return isWarningActive(action)
  })
}

/**
 * Count active warnings of a specific type for an agent
 */
export function countActiveWarnings(
  agentEmail: string,
  warningType: WarningType,
  category: WarningCategory,
  allActions: ActionLog[]
): number {
  return getActiveWarningsByType(agentEmail, warningType, category, allActions).length
}

/**
 * Validate warning progression (can't skip levels)
 */
export function validateWarningProgression(
  agentEmail: string,
  newWarningType: WarningType,
  category: WarningCategory,
  allActions: ActionLog[]
): { isValid: boolean; message?: string } {
  const newConfig = WARNING_CONFIGS[newWarningType]
  const activeWarnings = getActiveWarnings(agentEmail, allActions, category)

  if (activeWarnings.length === 0) {
    // First warning must be Verbal
    if (newConfig.progressionOrder > 1) {
      return {
        isValid: false,
        message: 'First warning must be a Verbal Warning'
      }
    }
    return { isValid: true }
  }

  // Find highest active warning level
  const highestLevel = Math.max(
    ...activeWarnings.map(w => {
      const type = w.action_type as WarningType
      return WARNING_CONFIGS[type]?.progressionOrder || 0
    })
  )

  // New warning can be same level or one level higher
  if (newConfig.progressionOrder > highestLevel + 1) {
    return {
      isValid: false,
      message: `Cannot skip warning levels. Current highest: Level ${highestLevel}`
    }
  }

  return { isValid: true }
}

/**
 * Get warning progression status for an agent
 */
export interface WarningStatus {
  verbalWarnings: number
  writtenWarnings: number
  finalWarnings: number
  totalActiveWarnings: number
  highestWarningLevel: number
  nextRecommendedAction: string
  isAtRisk: boolean
}

export function getWarningStatus(
  agentEmail: string,
  category: WarningCategory,
  allActions: ActionLog[]
): WarningStatus {
  const verbalWarnings = countActiveWarnings(agentEmail, 'Verbal Warning', category, allActions)
  const writtenWarnings = countActiveWarnings(agentEmail, 'Written Warning', category, allActions)
  const finalWarnings = countActiveWarnings(agentEmail, 'Final Warning', category, allActions)
  const pipWarnings = countActiveWarnings(agentEmail, 'PIP', category, allActions)

  const totalActiveWarnings = verbalWarnings + writtenWarnings + finalWarnings + pipWarnings
  const highestWarningLevel = Math.max(
    verbalWarnings > 0 ? 1 : 0,
    writtenWarnings > 0 ? 2 : 0,
    finalWarnings > 0 || pipWarnings > 0 ? 3 : 0
  )

  let nextRecommendedAction = 'Monitor Performance'
  let isAtRisk = false

  // Determine next action based on warning history
  if (writtenWarnings >= 2) {
    nextRecommendedAction = 'Prepare for Termination'
    isAtRisk = true
  } else if (writtenWarnings >= 1) {
    nextRecommendedAction = 'Consider Final Warning or PIP'
    isAtRisk = true
  } else if (verbalWarnings >= 2) {
    nextRecommendedAction = 'Issue Written Warning'
    isAtRisk = false
  } else if (verbalWarnings >= 1) {
    nextRecommendedAction = 'Issue 2nd Verbal Warning + Coaching'
    isAtRisk = false
  } else if (totalActiveWarnings === 0) {
    nextRecommendedAction = 'Issue Verbal Warning'
    isAtRisk = false
  }

  return {
    verbalWarnings,
    writtenWarnings,
    finalWarnings,
    totalActiveWarnings,
    highestWarningLevel,
    nextRecommendedAction,
    isAtRisk
  }
}

/**
 * Check if coaching sessions exist for an agent
 */
export function hasRecentCoaching(
  agentEmail: string,
  allActions: ActionLog[],
  daysBack: number = 30
): boolean {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysBack)

  return allActions.some(action => {
    if (action.agent_email !== agentEmail) return false
    if (!action.action_type.toLowerCase().includes('coaching')) return false
    const actionDate = new Date(action.action_date)
    return actionDate >= cutoffDate
  })
}
