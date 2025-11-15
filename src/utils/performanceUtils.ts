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
 * Low: Orange (QSoftware Primary)
 * Critical: Red
 *
 * Note: Colors match CSS variables in src/style.css
 * - Success: var(--q-success) #22C55E
 * - Success Light: var(--q-success-light) #86EFAC
 * - Warning: var(--q-warning) #F59E0B
 * - Primary: var(--q-primary) #F7941D
 * - Danger: var(--q-danger) #EF4444
 * - Text Light: var(--q-text-light) #8B9DA9
 */
export function getFlagConfig(flag: string): PerformanceFlag {
  const flagUpper = flag?.toUpperCase() || '';

  switch (flagUpper) {
    case 'GREAT':
      return {
        label: 'Great',
        severity: 'success',
        color: '#22C55E' // QSoftware Success Green (var(--q-success))
      };
    case 'GOOD':
      return {
        label: 'Good',
        severity: 'info',
        color: '#86EFAC' // QSoftware Success Light (var(--q-success-light))
      };
    case 'NORMAL':
      return {
        label: 'Normal',
        severity: 'warning',
        color: '#F59E0B' // QSoftware Warning Yellow (var(--q-warning))
      };
    case 'LOW':
      return {
        label: 'Low',
        severity: 'warning',
        color: '#F7941D' // QSoftware Primary Orange (var(--q-primary))
      };
    case 'CRITICAL':
      return {
        label: 'Critical',
        severity: 'danger',
        color: '#EF4444' // QSoftware Danger Red (var(--q-danger))
      };
    default:
      return {
        label: flag || 'N/A',
        severity: 'secondary',
        color: '#8B9DA9' // QSoftware Text Light Gray (var(--q-text-light))
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
