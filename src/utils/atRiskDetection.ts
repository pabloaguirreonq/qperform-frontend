// At Risk Agent Detection System
// Identifies agents who are at high risk of termination based on performance and warnings

import type { PerformanceData, ActionLog } from '@/types'
import { getWarningStatus, type WarningCategory } from './warningSystem'

export interface AtRiskStatus {
  isAtRisk: boolean
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  reasons: string[]
  consecutiveUnderperformingWeeks: number
  totalUnderperformingWeeks: number
  hasMultipleWrittenWarnings: boolean
  requiresImmediateAction: boolean
}

/**
 * Check if performance is underperforming based on flag
 */
function isUnderperforming(flag: string): boolean {
  return flag === 'Critical' || flag === 'Low'
}

/**
 * Calculate consecutive underperforming weeks
 */
export function calculateConsecutiveWeeks(
  agentPerformance: PerformanceData[],
  category: 'QA' | 'Production'
): number {
  // Sort by date descending (most recent first)
  const sorted = [...agentPerformance].sort((a, b) =>
    new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  )

  let consecutive = 0
  for (const perf of sorted) {
    const flag = category === 'QA' ? perf.flag_qa : perf.flag_prod
    if (isUnderperforming(flag)) {
      consecutive++
    } else {
      break // Stop at first non-underperforming week
    }
  }

  return consecutive
}

/**
 * Calculate total underperforming weeks in the current month
 */
export function calculateTotalUnderperformingWeeks(
  agentPerformance: PerformanceData[],
  category: 'QA' | 'Production'
): number {
  return agentPerformance.filter(perf => {
    const flag = category === 'QA' ? perf.flag_qa : perf.flag_prod
    return isUnderperforming(flag)
  }).length
}

/**
 * Determine if agent is "At Risk" based on requirements
 *
 * Criteria:
 * 1. Underperforming for 3 consecutive weeks
 * 2. Underperforming for 3 total weeks in the month
 * 3. Has 2 Written Warnings (waiting for 3rd strike)
 */
export function determineAtRiskStatus(
  agentEmail: string,
  agentPerformance: PerformanceData[],
  category: WarningCategory,
  allActions: ActionLog[]
): AtRiskStatus {
  const reasons: string[] = []
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW'
  let isAtRisk = false
  let requiresImmediateAction = false

  // Convert category to performance type
  const perfCategory: 'QA' | 'Production' = category === 'Substandard Work - QA' ? 'QA' : 'Production'

  // Calculate consecutive and total underperforming weeks
  const consecutiveWeeks = calculateConsecutiveWeeks(agentPerformance, perfCategory)
  const totalWeeks = calculateTotalUnderperformingWeeks(agentPerformance, perfCategory)

  // Get warning status
  const warningStatus = getWarningStatus(agentEmail, category, allActions)

  // Check Criterion 1: 3 consecutive underperforming weeks
  if (consecutiveWeeks >= 3) {
    isAtRisk = true
    riskLevel = 'HIGH'
    reasons.push(`${consecutiveWeeks} consecutive underperforming weeks`)
  }

  // Check Criterion 2: 3 total underperforming weeks in month
  if (totalWeeks >= 3) {
    isAtRisk = true
    if (riskLevel === 'LOW') riskLevel = 'MEDIUM'
    reasons.push(`${totalWeeks} total underperforming weeks this month`)
  }

  // Check Criterion 3: 2 Written Warnings
  const hasMultipleWrittenWarnings = warningStatus.writtenWarnings >= 2
  if (hasMultipleWrittenWarnings) {
    isAtRisk = true
    riskLevel = 'CRITICAL'
    requiresImmediateAction = true
    reasons.push(`${warningStatus.writtenWarnings} active Written Warnings (one more strike = termination)`)
  }

  // Check for 1 Written Warning (medium risk)
  if (warningStatus.writtenWarnings === 1) {
    if (!isAtRisk) {
      isAtRisk = true
      riskLevel = 'MEDIUM'
    }
    reasons.push('1 active Written Warning')
  }

  // Check combination: Multiple verbal warnings + underperforming
  if (warningStatus.verbalWarnings >= 2 && (consecutiveWeeks >= 2 || totalWeeks >= 2)) {
    if (riskLevel === 'LOW') riskLevel = 'MEDIUM'
    if (!isAtRisk) isAtRisk = true
    reasons.push('Multiple Verbal Warnings with ongoing underperformance')
  }

  return {
    isAtRisk,
    riskLevel,
    reasons,
    consecutiveUnderperformingWeeks: consecutiveWeeks,
    totalUnderperformingWeeks: totalWeeks,
    hasMultipleWrittenWarnings,
    requiresImmediateAction
  }
}

/**
 * Get all at-risk agents from performance data
 */
export interface AtRiskAgent {
  agentEmail: string
  agentName: string
  client: string
  category: string
  atRiskStatus: AtRiskStatus
}

export function getAtRiskAgents(
  performanceData: PerformanceData[],
  warningCategory: WarningCategory,
  allActions: ActionLog[]
): AtRiskAgent[] {
  // Group by agent
  const agentMap = new Map<string, PerformanceData[]>()
  performanceData.forEach(data => {
    const existing = agentMap.get(data.agent_email) || []
    agentMap.set(data.agent_email, [...existing, data])
  })

  const atRiskAgents: AtRiskAgent[] = []

  agentMap.forEach((agentPerformance, agentEmail) => {
    const atRiskStatus = determineAtRiskStatus(
      agentEmail,
      agentPerformance,
      warningCategory,
      allActions
    )

    if (atRiskStatus.isAtRisk) {
      const firstRecord = agentPerformance[0]
      atRiskAgents.push({
        agentEmail,
        agentName: firstRecord.agent_name || agentEmail.split('@')[0],
        client: firstRecord.client,
        category: firstRecord.category,
        atRiskStatus
      })
    }
  })

  // Sort by risk level (CRITICAL -> HIGH -> MEDIUM -> LOW)
  const riskOrder = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 }
  return atRiskAgents.sort((a, b) =>
    riskOrder[a.atRiskStatus.riskLevel] - riskOrder[b.atRiskStatus.riskLevel]
  )
}

/**
 * Get risk badge color
 */
export function getRiskBadgeColor(riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): string {
  switch (riskLevel) {
    case 'CRITICAL':
      return 'var(--q-danger)'
    case 'HIGH':
      return 'var(--q-primary)' // OnQ Orange
    case 'MEDIUM':
      return 'var(--q-warning)'
    case 'LOW':
      return 'var(--q-info)'
  }
}

/**
 * Get risk badge severity for PrimeVue
 */
export function getRiskBadgeSeverity(riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): 'success' | 'warning' | 'danger' | 'info' {
  switch (riskLevel) {
    case 'CRITICAL':
      return 'danger'
    case 'HIGH':
      return 'danger'
    case 'MEDIUM':
      return 'warning'
    case 'LOW':
      return 'info'
  }
}
