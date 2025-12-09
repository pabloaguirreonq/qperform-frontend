// Recommendation Engine - Cases A through E
// Based on QPerform requirements for automated recommendations

import type { ActionLog, PerformanceData, AgentMonthlyResults } from '@/types'
import { getWarningStatus, hasRecentCoaching, type WarningCategory } from './warningSystem'

export interface RecommendationResult {
  caseType: 'A' | 'B' | 'C' | 'D' | 'E' | 'MONITOR' | 'COACHING_ONLY'
  action: string
  isCritical: boolean
  notes: string
  requiresLeadershipAction: boolean
  targetType: 'Agent' | 'Leadership'
  priority: 1 | 2 | 3 | 4 | 5 // 1 = Highest priority
}

/**
 * CASE A: Agent has 1 Verbal Warning + new underperformance
 * Recommendation: Issue 2nd Verbal Warning + Coaching
 */
function evaluateCaseA(
  agentEmail: string,
  category: WarningCategory,
  allActions: ActionLog[],
  isUnderperforming: boolean
): RecommendationResult | null {
  const warningStatus = getWarningStatus(agentEmail, category, allActions)

  if (warningStatus.verbalWarnings === 1 && warningStatus.writtenWarnings === 0 && isUnderperforming) {
    return {
      caseType: 'A',
      action: 'Issue 2nd Verbal Warning + Coaching Session',
      isCritical: false,
      notes: 'Agent has 1 active Verbal Warning and continues to underperform. Escalation: 2nd Verbal Warning with mandatory coaching.',
      requiresLeadershipAction: false,
      targetType: 'Agent',
      priority: 3
    }
  }

  return null
}

/**
 * CASE B: Agent has 2 Verbal Warnings + new underperformance
 * Recommendation: Issue Written Warning
 */
function evaluateCaseB(
  agentEmail: string,
  category: WarningCategory,
  allActions: ActionLog[],
  isUnderperforming: boolean
): RecommendationResult | null {
  const warningStatus = getWarningStatus(agentEmail, category, allActions)

  if (warningStatus.verbalWarnings >= 2 && warningStatus.writtenWarnings === 0 && isUnderperforming) {
    return {
      caseType: 'B',
      action: 'Issue Written Warning',
      isCritical: true,
      notes: 'Agent has 2 active Verbal Warnings and continues to underperform. CRITICAL: Escalate to Written Warning immediately.',
      requiresLeadershipAction: false,
      targetType: 'Agent',
      priority: 2
    }
  }

  return null
}

/**
 * CASE C: Agent has 2 Written Warnings + new underperformance
 * Recommendation: Prepare for Employee Offboarding
 */
function evaluateCaseC(
  agentEmail: string,
  category: WarningCategory,
  allActions: ActionLog[],
  isUnderperforming: boolean
): RecommendationResult | null {
  const warningStatus = getWarningStatus(agentEmail, category, allActions)

  if (warningStatus.writtenWarnings >= 2 && isUnderperforming) {
    return {
      caseType: 'C',
      action: 'Prepare for Employee Termination',
      isCritical: true,
      notes: 'Agent has 2 active Written Warnings and continues to underperform. CRITICAL: Begin offboarding preparation. Consult HR immediately.',
      requiresLeadershipAction: true,
      targetType: 'Agent',
      priority: 1
    }
  }

  return null
}

/**
 * CASE D: Agent underperforming 2+ weeks with NO actions taken
 * Recommendation: Director provides Leadership Behavior Report to AVP + Verbal Warning to Leader
 */
function evaluateCaseD(
  agentEmail: string,
  leaderEmail: string,
  underperformingWeeks: number,
  actionsTaken: number,
  allLeaderActions: ActionLog[]
): RecommendationResult | null {
  // Agent underperforming 2+ weeks but leader took no action
  if (underperformingWeeks >= 2 && actionsTaken === 0) {
    // Check if leader already has a warning for this
    const leaderWarnings = allLeaderActions.filter(
      action => action.agent_email === leaderEmail && action.action_type.includes('Leadership')
    )

    return {
      caseType: 'D',
      action: 'Issue Leadership Behavior Report to AVP + Verbal Warning to Leader',
      isCritical: true,
      notes: `Leader ${leaderEmail} failed to take action on agent ${agentEmail} who has been underperforming for ${underperformingWeeks} weeks. Director must provide Leadership Behavior Report to AVP and issue Verbal Warning to leader.`,
      requiresLeadershipAction: true,
      targetType: 'Leadership',
      priority: 2
    }
  }

  return null
}

/**
 * CASE E: Leader fails procedures 2nd time (within Verbal Warning timeframe)
 * Recommendation: Director provides 2nd Leadership Behavior Report + Written Warning to Leader
 */
function evaluateCaseE(
  leaderEmail: string,
  allLeaderActions: ActionLog[]
): RecommendationResult | null {
  const leaderVerbalWarnings = allLeaderActions.filter(
    action =>
      action.agent_email === leaderEmail &&
      action.action_type.includes('Verbal Warning') &&
      action.warning_type?.includes('Leadership')
  )

  if (leaderVerbalWarnings.length >= 1) {
    // Check if there's a recent failure (new case D situation)
    // This would be determined by checking for new underperforming agents with no action
    return {
      caseType: 'E',
      action: 'Issue 2nd Leadership Behavior Report + Written Warning to Leader',
      isCritical: true,
      notes: `Leader ${leaderEmail} has failed to follow procedures again within the Verbal Warning timeframe. Director must provide 2nd Leadership Behavior Report to AVP and issue Written Warning to leader.`,
      requiresLeadershipAction: true,
      targetType: 'Leadership',
      priority: 1
    }
  }

  return null
}

/**
 * Main recommendation generator for an agent
 */
export function generateAgentRecommendation(
  agentEmail: string,
  category: WarningCategory,
  allActions: ActionLog[],
  monthlyResults: AgentMonthlyResults,
  underperformingWeeksThisMonth: number
): RecommendationResult {
  const isUnderperforming = underperformingWeeksThisMonth > 0

  // Evaluate cases in priority order (C -> B -> A)
  const caseC = evaluateCaseC(agentEmail, category, allActions, isUnderperforming)
  if (caseC) return caseC

  const caseB = evaluateCaseB(agentEmail, category, allActions, isUnderperforming)
  if (caseB) return caseB

  const caseA = evaluateCaseA(agentEmail, category, allActions, isUnderperforming)
  if (caseA) return caseA

  // Check if agent needs coaching only (no warnings yet but underperforming)
  if (isUnderperforming) {
    const warningStatus = getWarningStatus(agentEmail, category, allActions)
    const hasCoaching = hasRecentCoaching(agentEmail, allActions, 30)

    if (warningStatus.totalActiveWarnings === 0) {
      if (!hasCoaching) {
        return {
          caseType: 'COACHING_ONLY',
          action: 'Provide Coaching Session',
          isCritical: false,
          notes: 'Agent is underperforming but has no active warnings. Start with coaching before issuing warnings.',
          requiresLeadershipAction: false,
          targetType: 'Agent',
          priority: 4
        }
      } else {
        return {
          caseType: 'A',
          action: 'Issue Verbal Warning',
          isCritical: false,
          notes: 'Agent has received coaching but continues to underperform. Issue first Verbal Warning.',
          requiresLeadershipAction: false,
          targetType: 'Agent',
          priority: 3
        }
      }
    }
  }

  // Default: Monitor
  return {
    caseType: 'MONITOR',
    action: 'Continue Monitoring',
    isCritical: false,
    notes: 'Agent is performing within acceptable standards. Continue regular monitoring.',
    requiresLeadershipAction: false,
    targetType: 'Agent',
    priority: 5
  }
}

/**
 * Generate leadership recommendation (Cases D & E)
 */
export function generateLeadershipRecommendation(
  leaderEmail: string,
  agentEmail: string,
  underperformingWeeks: number,
  actionsTaken: number,
  allActions: ActionLog[]
): RecommendationResult | null {
  // Check Case E first (higher priority)
  const caseE = evaluateCaseE(leaderEmail, allActions)
  if (caseE) return caseE

  // Check Case D
  const caseD = evaluateCaseD(agentEmail, leaderEmail, underperformingWeeks, actionsTaken, allActions)
  if (caseD) return caseD

  return null
}

/**
 * Generate all recommendations for a performance review period
 */
export interface AgentRecommendationWithContext {
  agentEmail: string
  agentName: string
  recommendation: RecommendationResult
  underperformingWeeks: number
  totalWeeks: number
  actionsTaken: number
}

export function generateAllRecommendations(
  performanceData: PerformanceData[],
  allActions: ActionLog[],
  category: WarningCategory
): AgentRecommendationWithContext[] {
  // Group by agent
  const agentMap = new Map<string, PerformanceData[]>()
  performanceData.forEach(data => {
    const existing = agentMap.get(data.agent_email) || []
    agentMap.set(data.agent_email, [...existing, data])
  })

  const recommendations: AgentRecommendationWithContext[] = []

  agentMap.forEach((agentData, agentEmail) => {
    const underperformingWeeks = agentData.filter(d => {
      const flag = category === 'Substandard Work - QA' ? d.flag_qa : d.flag_prod
      return flag === 'Critical' || flag === 'Low'
    }).length

    const totalWeeks = agentData.length

    const actionsTaken = allActions.filter(
      action => action.agent_email === agentEmail
    ).length

    const monthlyResults: AgentMonthlyResults = {
      compliantWeeks: totalWeeks - underperformingWeeks,
      totalWeeks,
      actionCount: actionsTaken
    }

    const recommendation = generateAgentRecommendation(
      agentEmail,
      category,
      allActions,
      monthlyResults,
      underperformingWeeks
    )

    recommendations.push({
      agentEmail,
      agentName: agentData[0]?.agent_name || agentEmail.split('@')[0],
      recommendation,
      underperformingWeeks,
      totalWeeks,
      actionsTaken
    })
  })

  // Sort by priority (1 = highest)
  return recommendations.sort((a, b) => a.recommendation.priority - b.recommendation.priority)
}
