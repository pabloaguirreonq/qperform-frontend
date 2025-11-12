
<template>
  <Dialog :visible="visible" modal header="Take Action" :style="{ width: '500px' }" @update:visible="$emit('update:visible', $event)">
    <div class="p-fluid">
      <div class="p-field">
        <label for="employee">Employee</label>
        <Dropdown id="employee" v-model="selectedEmployee" :options="employees" optionLabel="name" placeholder="Select an employee" />
      </div>
      <div class="p-field">
        <label for="week">Week</label>
        <Dropdown id="week" v-model="selectedWeek" :options="weekRanges" optionLabel="week_range" placeholder="Select a week" />
      </div>
      <div class="p-field">
        <label for="actionType">Action Type</label>
        <Dropdown id="actionType" v-model="actionType" :options="actionTypes" placeholder="Select an action type" />
      </div>
      <div class="p-field">
        <label for="notes">Notes</label>
        <Textarea id="notes" v-model="notes" rows="4" />
      </div>
    </div>
    <template #footer>
      <Button label="Cancel" text @click="closeDialog" />
      <Button label="Submit Action" icon="pi pi-check" @click="submit" :loading="isLoading" />
    </template>
    <Toast />
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { createActionLog } from '@/services/api';

const props = defineProps<{
  visible: boolean;
  employees: { id: string; name: string; email: string }[];
  weekRanges: { start_date: string; end_date: string; week_range: string }[];
  preSelectedEmployee?: string;
}>();

const emit = defineEmits(['update:visible', 'action-success']);

const toast = useToast();
const isLoading = ref(false);

const selectedEmployee = ref<typeof props.employees[0] | null>(null);
const selectedWeek = ref<typeof props.weekRanges[0] | null>(null);
const actionType = ref<string | null>(null);
const notes = ref('');

const actionTypes = ref([
  'Coaching', 
  'Training', 
  'Performance Improvement Plan', 
  'Verbal Warning', 
  'Written Warning',
  'Other'
]);

watch(() => props.visible, (newValue) => {
  if (newValue) {
    // If a pre-selected employee is provided, find and set them
    if (props.preSelectedEmployee) {
      selectedEmployee.value = props.employees.find(e => e.id === props.preSelectedEmployee) || null;
    } else {
      selectedEmployee.value = null;
    }
    // Reset other fields
    selectedWeek.value = props.weekRanges.length > 0 ? props.weekRanges[0] : null;
    actionType.value = null;
    notes.value = '';
  }
});

const closeDialog = () => {
  emit('update:visible', false);
};

const submit = async () => {
  if (!selectedEmployee.value || !selectedWeek.value || !actionType.value) {
    toast.add({ severity: 'warn', summary: 'Missing Information', detail: 'Please fill out all fields.', life: 3000 });
    return;
  }

  isLoading.value = true;
  try {
    await createActionLog({
      agent_email: selectedEmployee.value.email,
      action_date: new Date().toISOString(),
      action_type: actionType.value,
      week_start_date: selectedWeek.value.start_date,
      week_end_date: selectedWeek.value.end_date,
      notes: notes.value
    });
    toast.add({ severity: 'success', summary: 'Success', detail: 'Action logged successfully', life: 3000 });
    emit('action-success');
    closeDialog();
  } catch (error) {
    console.error('Failed to log action:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to log action.', life: 3000 });
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.p-field {
  margin-bottom: 1.5rem;
}
</style>
