
<template>
  <div class="performance-score-badge">
    <Tag :severity="badgeSeverity">
      {{ formattedScore }}
    </Tag>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Tag from 'primevue/tag';

const props = defineProps<{
  flag: string;
  kpi: number | string;
}>();

const formattedScore = computed(() => {
  const numKpi = typeof props.kpi === 'string' ? parseFloat(props.kpi) : props.kpi;
  if (isNaN(numKpi)) return 'N/A';
  return `${numKpi.toFixed(0)}%`;
});

const badgeSeverity = computed(() => {
  switch (props.flag) {
    case 'green':
      return 'success';
    case 'yellow':
      return 'warning';
    case 'red':
      return 'danger';
    default:
      return 'info';
  }
});
</script>

<style scoped>
.performance-score-badge {
  display: inline-block;
}
</style>
