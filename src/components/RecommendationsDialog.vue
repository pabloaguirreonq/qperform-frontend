
<template>
  <Dialog :visible="visible" modal header="Action Recommendation" :style="{ width: '450px' }" @update:visible="$emit('update:visible', $event)">
    <div class="recommendation-content">
      <div v-if="recommendation.isCritical" class="critical-banner">
        <i class="pi pi-exclamation-triangle"></i>
        <span>CRITICAL: Immediate action required.</span>
      </div>
      <div class="agent-info">
        <Avatar :label="agentInitials" shape="circle" size="large" />
        <div class="agent-details">
          <div class="agent-name">{{ agentName }}</div>
          <div class="agent-results">Score: {{ monthlyResults.compliantWeeks }}/5 | Actions: {{ monthlyResults.actionCount }}/3</div>
        </div>
      </div>
      <div class="recommendation-details">
        <h5>Recommended Action</h5>
        <p class="action-text">{{ recommendation.action }}</p>
        <div v-if="recommendation.notes" class="notes-section">
          <h6>Notes</h6>
          <p>{{ recommendation.notes }}</p>
        </div>
      </div>
    </div>
    <template #footer>
      <Button label="Close" text @click="$emit('update:visible', false)" />
      <Button label="Take Action" icon="pi pi-arrow-right" @click="takeAction" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';

const props = defineProps<{
  visible: boolean;
  agentName: string;
  monthlyResults: { compliantWeeks: number; totalWeeks: number; actionCount: number };
  recommendation: { action: string; isCritical: boolean; notes: string };
}>();

defineEmits(['update:visible', 'take-action']);

const agentInitials = computed(() => {
  if (!props.agentName) return '';
  const parts = props.agentName.split(' ');
  if (parts.length >= 2) {
    return parts[0][0] + parts[parts.length - 1][0];
  }
  return props.agentName.substring(0, 2).toUpperCase();
});

const takeAction = () => {
  // This would typically open a more detailed action dialog
  // For now, it just emits an event
  // emit('take-action', props.agentName);
};

</script>

<style scoped>
.recommendation-content {
  padding: 1rem;
}
.critical-banner {
  background-color: #fffbe6; /* PrimeVue warning color light */
  color: #c08d1d; /* PrimeVue warning color dark */
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #c08d1d;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.agent-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.agent-details {
  flex-grow: 1;
}
.agent-name {
  font-weight: 600;
  font-size: 1.1rem;
}
.agent-results {
  color: #6c757d;
}
.recommendation-details h5 {
  margin-top: 0;
}
.action-text {
  font-size: 1.1rem;
  font-style: italic;
  margin-bottom: 1rem;
}
.notes-section {
  background-color: #f8f9fa;
  padding: 0.75rem;
  border-radius: 6px;
}
.notes-section h6 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}
</style>
