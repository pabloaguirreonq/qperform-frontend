// Utility functions for performance data processing

export interface PerformanceFlag {
  label: string;
  severity: 'success' | 'info' | 'warning' | 'danger' | 'secondary';
  color: string;
}

/**
 * Get flag configuration based on OnQ Performance Standards
 * Great (>101% Production, >100% QA): Green
 * Good: Light Green
 * Normal: Yellow
 * Low: Orange
 * Critical: Red
 */
export function getFlagConfig(flag: string): PerformanceFlag {
  const flagUpper = flag?.toUpperCase() || '';

  switch (flagUpper) {
    case 'GREAT':
      return {
        label: 'Great',
        severity: 'success',
        color: '#22c55e' // Green
      };
    case 'GOOD':
      return {
        label: 'Good',
        severity: 'info',
        color: '#86efac' // Light Green
      };
    case 'NORMAL':
      return {
        label: 'Normal',
        severity: 'warning',
        color: '#eab308' // Yellow
      };
    case 'LOW':
      return {
        label: 'Low',
        severity: 'warning',
        color: '#f97316' // Orange
      };
    case 'CRITICAL':
      return {
        label: 'Critical',
        severity: 'danger',
        color: '#ef4444' // Red
      };
    default:
      return {
        label: flag || 'N/A',
        severity: 'secondary',
        color: '#6b7280' // Gray
      };
  }
}

/**
 * Format KPI percentage for display
 */
export function formatKpi(kpi: number | null | undefined): string {
  if (kpi === null || kpi === undefined) return 'N/A';
  return `${(kpi * 100).toFixed(2)}%`;
}

/**
 * Get severity class for week card based on flags
 */
export function getWeekCardSeverity(flagQa: string, flagProd: string): string {
  const flags = [flagQa?.toUpperCase(), flagProd?.toUpperCase()];

  if (flags.includes('CRITICAL')) return 'critical';
  if (flags.includes('LOW')) return 'low';
  if (flags.includes('NORMAL')) return 'normal';
  if (flags.includes('GOOD')) return 'good';
  if (flags.includes('GREAT')) return 'great';

  return 'normal';
}

/**
 * Determine recommendation based on warning history (Cases A-E from requirements)
 */
export interface RecommendationResult {
  action: string;
  isCritical: boolean;
  notes: string;
  case: string;
}

export function getRecommendation(
  compliantWeeks: number,
  totalWeeks: number,
  actionCount: number,
  hasVerbalWarning: boolean,
  hasWrittenWarning: boolean
): RecommendationResult {
  const underperformingWeeks = totalWeeks - compliantWeeks;

  // Case A: 4 consecutive weeks underperforming, no previous actions
  if (underperformingWeeks >= 4 && actionCount === 0) {
    return {
      action: 'Verbal Warning',
      isCritical: true,
      notes: 'Agent has 4 consecutive weeks underperforming with no prior actions taken. Immediate verbal warning required.',
      case: 'A'
    };
  }

  // Case B: 4 consecutive weeks underperforming, has verbal warning
  if (underperformingWeeks >= 4 && hasVerbalWarning && !hasWrittenWarning) {
    return {
      action: 'Written Warning',
      isCritical: true,
      notes: 'Agent has 4 consecutive weeks underperforming after verbal warning. Escalate to written warning.',
      case: 'B'
    };
  }

  // Case C: 4 consecutive weeks underperforming, has written warning
  if (underperformingWeeks >= 4 && hasWrittenWarning) {
    return {
      action: 'Performance Improvement Plan (PIP) or Termination',
      isCritical: true,
      notes: 'Agent has 4 consecutive weeks underperforming after written warning. Consider PIP or termination.',
      case: 'C'
    };
  }

  // Case D: Leadership accountability - no action taken when required
  if (underperformingWeeks >= 4 && actionCount === 0) {
    return {
      action: 'Notify Leadership',
      isCritical: true,
      notes: 'Leadership has not taken action for agent with 4+ weeks underperforming. Escalate to Director/AVP.',
      case: 'D'
    };
  }

  // Case E: Monitoring - some underperformance but not critical yet
  if (underperformingWeeks >= 2 && underperformingWeeks < 4) {
    return {
      action: 'Monitor Closely',
      isCritical: false,
      notes: 'Agent showing signs of underperformance. Continue monitoring and provide coaching.',
      case: 'E'
    };
  }

  // No action needed
  return {
    action: 'No Action Required',
    isCritical: false,
    notes: 'Agent performance is within acceptable range.',
    case: 'None'
  };
}
