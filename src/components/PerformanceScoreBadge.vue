
<template>
  <div class="performance-score-badge">
    <Tag
      :severity="badgeSeverity"
      :style="{ backgroundColor: badgeColor, borderColor: badgeColor }"
      class="performance-tag"
    >
      <span class="score-text">{{ formattedScore }}</span>
      <span v-if="showLevel" class="level-text">{{ performanceLevel }}</span>
    </Tag>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Tag from 'primevue/tag';
import {
  determinePerformanceLevel,
  getPerformanceLevelConfig,
  type MetricType
} from '@/utils/performanceThresholds';

const props = withDefaults(defineProps<{
  flag: string;
  kpi: number | string;
  metricType?: MetricType;
  showLevel?: boolean;
}>(), {
  metricType: 'QA',
  showLevel: false
});

const numericScore = computed(() => {
  const numKpi = typeof props.kpi === 'string' ? parseFloat(props.kpi) : props.kpi;
  return isNaN(numKpi) ? 0 : numKpi;
});

const formattedScore = computed(() => {
  if (numericScore.value === 0 && props.kpi === 'N/A') return 'N/A';
  return `${numericScore.value.toFixed(1)}%`;
});

const performanceLevel = computed(() => {
  if (numericScore.value === 0) return '';
  return determinePerformanceLevel(numericScore.value, props.metricType);
});

const levelConfig = computed(() => {
  if (numericScore.value === 0) {
    return {
      color: '#9CA3AF',
      severity: 'info' as const
    };
  }
  return getPerformanceLevelConfig(numericScore.value, props.metricType);
});

const badgeSeverity = computed(() => levelConfig.value.severity);
const badgeColor = computed(() => levelConfig.value.color);
</script>

<style scoped>
.performance-score-badge {
  display: inline-block;
}

.performance-tag {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 4px 8px;
  font-weight: 600;
}

.score-text {
  font-size: 13px;
}

.level-text {
  font-size: 9px;
  text-transform: uppercase;
  opacity: 0.9;
  font-weight: 700;
  letter-spacing: 0.5px;
}
</style>
