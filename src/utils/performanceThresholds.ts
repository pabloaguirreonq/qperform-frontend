// Performance Thresholds and Color Coding System
// Based on QPerform requirements for 5-level performance classification

export type PerformanceLevel = 'Great' | 'Good' | 'Normal' | 'Low' | 'Critical'
export type MetricType = 'Production' | 'QA'

export interface PerformanceLevelConfig {
  level: PerformanceLevel
  color: string
  severity: 'success' | 'info' | 'warning' | 'danger'
  minThreshold: number
  maxThreshold: number | null
  description: string
}

/**
 * QA Performance Thresholds (based on requirements)
 */
export const QA_THRESHOLDS: Record<PerformanceLevel, PerformanceLevelConfig> = {
  Great: {
    level: 'Great',
    color: '#22C55E', // Green
    severity: 'success',
    minThreshold: 100,
    maxThreshold: null,
    description: 'QA ≥ 100%'
  },
  Good: {
    level: 'Good',
    color: '#86EFAC', // Light Green
    severity: 'success',
    minThreshold: 99,
    maxThreshold: 100,
    description: 'QA ≥ 99% < 100%'
  },
  Normal: {
    level: 'Normal',
    color: '#FCD34D', // Yellow
    severity: 'warning',
    minThreshold: 98,
    maxThreshold: 99,
    description: 'QA ≥ 98% < 99%'
  },
  Low: {
    level: 'Low',
    color: '#FB923C', // Orange
    severity: 'warning',
    minThreshold: 97,
    maxThreshold: 98,
    description: 'QA > 97% < 98%'
  },
  Critical: {
    level: 'Critical',
    color: '#EF4444', // Red
    severity: 'danger',
    minThreshold: 0,
    maxThreshold: 97,
    description: 'QA < 97%'
  }
}

/**
 * Production Performance Thresholds (based on requirements)
 */
export const PRODUCTION_THRESHOLDS: Record<PerformanceLevel, PerformanceLevelConfig> = {
  Great: {
    level: 'Great',
    color: '#22C55E', // Green
    severity: 'success',
    minThreshold: 101,
    maxThreshold: null,
    description: 'Production > 101%'
  },
  Good: {
    level: 'Good',
    color: '#86EFAC', // Light Green
    severity: 'success',
    minThreshold: 100,
    maxThreshold: 101,
    description: 'Production ≥ 100% < 101%'
  },
  Normal: {
    level: 'Normal',
    color: '#FCD34D', // Yellow
    severity: 'warning',
    minThreshold: 99,
    maxThreshold: 100,
    description: 'Production ≥ 99% < 100%'
  },
  Low: {
    level: 'Low',
    color: '#FB923C', // Orange
    severity: 'warning',
    minThreshold: 98,
    maxThreshold: 99,
    description: 'Production > 98% < 99%'
  },
  Critical: {
    level: 'Critical',
    color: '#EF4444', // Red
    severity: 'danger',
    minThreshold: 0,
    maxThreshold: 98,
    description: 'Production < 98%'
  }
}

/**
 * Determine performance level based on score and metric type
 */
export function determinePerformanceLevel(score: number, metricType: MetricType): PerformanceLevel {
  const thresholds = metricType === 'QA' ? QA_THRESHOLDS : PRODUCTION_THRESHOLDS

  if (metricType === 'QA') {
    if (score >= 100) return 'Great'
    if (score >= 99) return 'Good'
    if (score >= 98) return 'Normal'
    if (score > 97) return 'Low'
    return 'Critical'
  } else {
    // Production
    if (score > 101) return 'Great'
    if (score >= 100) return 'Good'
    if (score >= 99) return 'Normal'
    if (score > 98) return 'Low'
    return 'Critical'
  }
}

/**
 * Get performance level configuration
 */
export function getPerformanceLevelConfig(
  score: number,
  metricType: MetricType
): PerformanceLevelConfig {
  const level = determinePerformanceLevel(score, metricType)
  const thresholds = metricType === 'QA' ? QA_THRESHOLDS : PRODUCTION_THRESHOLDS
  return thresholds[level]
}

/**
 * Check if performance is underperforming (Low or Critical)
 */
export function isUnderperforming(score: number, metricType: MetricType): boolean {
  const level = determinePerformanceLevel(score, metricType)
  return level === 'Low' || level === 'Critical'
}

/**
 * Get color for performance score
 */
export function getPerformanceColor(score: number, metricType: MetricType): string {
  const config = getPerformanceLevelConfig(score, metricType)
  return config.color
}

/**
 * Get severity for PrimeVue Tag component
 */
export function getPerformanceSeverity(
  score: number,
  metricType: MetricType
): 'success' | 'info' | 'warning' | 'danger' {
  const config = getPerformanceLevelConfig(score, metricType)
  return config.severity
}

/**
 * Format score with level indicator
 */
export function formatScoreWithLevel(score: number, metricType: MetricType): string {
  const level = determinePerformanceLevel(score, metricType)
  return `${score.toFixed(1)}% (${level})`
}
