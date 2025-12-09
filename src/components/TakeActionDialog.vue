
<template>
  <Dialog :visible="visible" modal header="Take Action" :style="{ width: '600px' }" @update:visible="$emit('update:visible', $event)">
    <div class="p-fluid">
      <!-- Employee Selection -->
      <div class="p-field">
        <label for="employee">Employee <span class="required">*</span></label>
        <Dropdown
          id="employee"
          v-model="selectedEmployee"
          :options="employees"
          optionLabel="name"
          placeholder="Select an employee"
          filter
          showClear
        >
          <template #option="slotProps">
            <div class="employee-option">
              <strong>{{ slotProps.option.name }}</strong>
              <small>{{ slotProps.option.email }}</small>
            </div>
          </template>
        </Dropdown>
      </div>

      <!-- Week Selection -->
      <div class="p-field">
        <label for="week">Week <span class="required">*</span></label>
        <Dropdown
          id="week"
          v-model="selectedWeek"
          :options="weekRanges"
          optionLabel="week_range"
          placeholder="Select a week"
        />
      </div>

      <!-- Action Type Selection -->
      <div class="p-field">
        <label for="actionType">Action Type <span class="required">*</span></label>
        <Dropdown
          id="actionType"
          v-model="actionType"
          :options="actionTypes"
          optionLabel="label"
          optionValue="value"
          placeholder="Select an action type"
          @change="handleActionTypeChange"
          class="w-full"
        >
          <template #option="slotProps">
            <div class="action-type-option">
              <strong>{{ slotProps.option.value }}</strong>
              <small>{{ slotProps.option.label.split(' - ')[1] }}</small>
            </div>
          </template>
        </Dropdown>
      </div>

      <!-- Warning Type (only for warnings) -->
      <div v-if="isWarningAction" class="p-field">
        <label for="warningType">Warning Category <span class="required">*</span></label>
        <Dropdown
          id="warningType"
          v-model="warningCategory"
          :options="warningCategories"
          placeholder="Select warning category"
        />
        <small class="field-help">Specify whether this warning is for Production or QA performance</small>
      </div>

      <!-- Expiration Date (for warnings with expiration) -->
      <div v-if="showExpirationDate" class="p-field">
        <label for="expirationDate">Expiration Date</label>
        <Calendar
          id="expirationDate"
          v-model="expirationDate"
          :minDate="minExpirationDate"
          dateFormat="mm/dd/yy"
          showIcon
          :disabled="true"
        />
        <small class="field-help">{{ expirationHelp }}</small>
      </div>

      <!-- Client & Category (auto-populated from agent data) -->
      <div class="p-field">
        <label for="client">Client</label>
        <InputText id="client" v-model="client" disabled />
        <small class="field-help">Auto-populated from employee data</small>
      </div>

      <div class="p-field">
        <label for="category">Category</label>
        <InputText id="category" v-model="category" disabled />
        <small class="field-help">Auto-populated from employee data</small>
      </div>

      <!-- Description/Notes -->
      <div class="p-field">
        <label for="notes">Description <span class="required">*</span></label>
        <Textarea
          id="notes"
          v-model="notes"
          rows="4"
          placeholder="Enter detailed notes about this action..."
        />
        <small class="field-help">{{ notesHelp }}</small>
      </div>

      <!-- Validation Messages -->
      <div v-if="validationError" class="validation-error">
        <i class="pi pi-exclamation-circle"></i>
        <span>{{ validationError }}</span>
      </div>

      <!-- Warning Progression Info -->
      <div v-if="isWarningAction && selectedEmployee && warningStatus" class="warning-status-info">
        <h4>Current Warning Status for {{ selectedEmployee.name }}</h4>
        <div class="status-grid">
          <div class="status-item">
            <span class="status-label">Verbal Warnings:</span>
            <Tag :value="warningStatus.verbalWarnings.toString()" severity="warning" />
          </div>
          <div class="status-item">
            <span class="status-label">Written Warnings:</span>
            <Tag :value="warningStatus.writtenWarnings.toString()" severity="danger" />
          </div>
          <div class="status-item">
            <span class="status-label">Next Recommended:</span>
            <span class="status-value">{{ warningStatus.nextRecommendedAction }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <Button label="Cancel" text @click="closeDialog" />
      <Button
        label="Submit Action"
        icon="pi pi-check"
        @click="submit"
        :loading="isLoading"
        :disabled="!canSubmit"
      />
    </template>
    <Toast />
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';
import Tag from 'primevue/tag';
import { useToast } from 'primevue/usetoast';
import { createAction, fetchPerformanceData } from '@/services/api';
import {
  calculateExpirationDate,
  validateWarningProgression,
  getWarningStatus,
  WARNING_CONFIGS,
  type WarningType,
  type WarningCategory
} from '@/utils/warningSystem';
import { useActionLogStore } from '@/stores/actionLogStore';

const props = defineProps<{
  visible: boolean;
  employees: { id: string; name: string; email: string }[];
  weekRanges: { start_date: string; end_date: string; week_range: string }[];
  preSelectedEmployee?: string;
}>();

const emit = defineEmits(['update:visible', 'action-success']);

const toast = useToast();
const actionLogStore = useActionLogStore();
const isLoading = ref(false);
const validationError = ref('');

// Form fields
const selectedEmployee = ref<{ id: string; name: string; email: string } | null>(null);
const selectedWeek = ref<{ start_date: string; end_date: string; week_range: string } | null>(null);
const actionType = ref<string | null>(null);
const warningCategory = ref<WarningCategory | null>(null);
const expirationDate = ref<Date | null>(null);
const notes = ref('');
const client = ref('');
const category = ref('');

const actionTypes = ref([
  { label: 'Coaching - Informal guidance and support', value: 'Coaching' },
  { label: 'Training - Skill development session', value: 'Training' },
  { label: 'Counseling - Formal discussion of concerns', value: 'Counseling' },
  { label: 'Verbal Warning - First formal warning (expires in 90 days)', value: 'Verbal Warning' },
  { label: 'Written Warning - Second formal warning (expires in 180 days)', value: 'Written Warning' },
  { label: 'Final Warning - Last warning before termination (expires in 365 days)', value: 'Final Warning' },
  { label: 'PIP - Performance Improvement Plan (no expiration)', value: 'PIP' },
  { label: 'Termination - Employment termination (permanent)', value: 'Termination' },
  { label: 'Other - Custom action type', value: 'Other' }
]);

const warningCategories = ref<WarningCategory[]>([
  'Substandard Work - Production',
  'Substandard Work - QA',
  'Other'
]);

// Computed properties
const isWarningAction = computed(() => {
  return actionType.value?.includes('Warning') || actionType.value === 'PIP' || actionType.value === 'Termination';
});

const showExpirationDate = computed(() => {
  return isWarningAction.value && actionType.value !== 'Termination';
});

const minExpirationDate = computed(() => {
  const today = new Date();
  today.setDate(today.getDate() + 1);
  return today;
});

const expirationHelp = computed(() => {
  if (!actionType.value || !isWarningAction.value) return '';

  const config = WARNING_CONFIGS[actionType.value as WarningType];
  if (!config) return '';

  if (config.expirationDays === 0) {
    return 'Permanent - No expiration';
  }

  return `Automatically set to ${config.expirationDays} days (${Math.floor(config.expirationDays / 30)} months) from action date`;
});

const notesHelp = computed(() => {
  if (isWarningAction.value) {
    return 'Required: Document specific performance issues and expectations for improvement';
  }
  if (actionType.value === 'Coaching') {
    return 'Document coaching topics, goals, and follow-up plan';
  }
  return 'Provide detailed information about this action';
});

const warningStatus = computed(() => {
  if (!selectedEmployee.value || !warningCategory.value) return null;

  const allActions = actionLogStore.actions;
  return getWarningStatus(selectedEmployee.value.email, warningCategory.value, allActions);
});

const canSubmit = computed(() => {
  if (!selectedEmployee.value || !selectedWeek.value || !actionType.value || !notes.value) {
    return false;
  }

  if (isWarningAction.value && !warningCategory.value) {
    return false;
  }

  return true;
});

// Watchers
watch(() => props.visible, (newValue) => {
  if (newValue) {
    resetForm();

    // Pre-select employee if provided
    if (props.preSelectedEmployee) {
      selectedEmployee.value = props.employees.find(e => e.id === props.preSelectedEmployee) || null;
      loadEmployeeData();
    }

    // Pre-select most recent week
    if (props.weekRanges.length > 0) {
      selectedWeek.value = props.weekRanges[0] || null;
    }
  }
});

watch(selectedEmployee, () => {
  loadEmployeeData();
  validationError.value = '';
});

watch(actionType, () => {
  validationError.value = '';
});

watch(warningCategory, () => {
  validationError.value = '';
});

// Methods
const handleActionTypeChange = () => {
  if (isWarningAction.value && actionType.value) {
    // Auto-calculate expiration date
    const config = WARNING_CONFIGS[actionType.value as WarningType];
    if (config && config.expirationDays > 0) {
      const calculated = calculateExpirationDate(actionType.value as WarningType, new Date());
      expirationDate.value = calculated;
    } else {
      expirationDate.value = null;
    }
  } else {
    expirationDate.value = null;
  }
};

const loadEmployeeData = async () => {
  if (!selectedEmployee.value) {
    client.value = '';
    category.value = '';
    return;
  }

  try {
    // Fetch employee's most recent performance data to get client/category
    const perfData = await fetchPerformanceData({
      year: new Date().getFullYear().toString()
    });

    const employeeData = perfData.find(
      d => d.agent_email === selectedEmployee.value!.email
    );

    if (employeeData) {
      client.value = employeeData.client;
      category.value = employeeData.category;
    }
  } catch (error) {
    console.error('Failed to load employee data:', error);
  }
};

const resetForm = () => {
  selectedEmployee.value = null;
  selectedWeek.value = null;
  actionType.value = null;
  warningCategory.value = null;
  expirationDate.value = null;
  notes.value = '';
  client.value = '';
  category.value = '';
  validationError.value = '';
};

const closeDialog = () => {
  emit('update:visible', false);
};

const validateForm = (): boolean => {
  if (!selectedEmployee.value) {
    validationError.value = 'Please select an employee';
    return false;
  }

  if (!selectedWeek.value) {
    validationError.value = 'Please select a week';
    return false;
  }

  if (!actionType.value) {
    validationError.value = 'Please select an action type';
    return false;
  }

  if (isWarningAction.value && !warningCategory.value) {
    validationError.value = 'Please select a warning category';
    return false;
  }

  if (!notes.value || notes.value.trim().length < 10) {
    validationError.value = 'Please provide detailed notes (at least 10 characters)';
    return false;
  }

  // Validate warning progression
  if (isWarningAction.value && warningCategory.value) {
    const allActions = actionLogStore.actions;
    const validation = validateWarningProgression(
      selectedEmployee.value.email,
      actionType.value as WarningType,
      warningCategory.value,
      allActions
    );

    if (!validation.isValid) {
      validationError.value = validation.message || 'Invalid warning progression';
      return false;
    }
  }

  return true;
};

const submit = async () => {
  if (!validateForm()) {
    return;
  }

  isLoading.value = true;
  try {
    await createAction({
      agent_email: selectedEmployee.value!.email,
      agent_name: selectedEmployee.value!.name,
      action_date: new Date().toISOString(),
      action_type: actionType.value!,
      description: notes.value,
      taken_by: 'Current User', // TODO: Get from auth context
      week_start_date: selectedWeek.value!.start_date,
      week_end_date: selectedWeek.value!.end_date,
      client: client.value,
      category: category.value,
      warning_type: isWarningAction.value ? warningCategory.value! : undefined,
      expiration_date: expirationDate.value?.toISOString(),
      is_active: true
    });

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Action logged successfully',
      life: 3000
    });

    emit('action-success');
    closeDialog();
  } catch (error) {
    console.error('Failed to log action:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to log action. Please try again.',
      life: 3000
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.p-field {
  margin-bottom: 1.5rem;
}

.required {
  color: var(--q-danger);
  font-weight: bold;
}

.field-help {
  display: block;
  margin-top: 0.25rem;
  color: var(--q-text-secondary);
  font-size: 0.875rem;
}

.employee-option {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.employee-option small {
  color: var(--q-text-secondary);
  font-size: 0.75rem;
}

.action-type-option {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.action-type-option strong {
  font-size: 0.95rem;
  color: var(--q-text-primary);
}

.action-type-option small {
  color: var(--q-text-secondary);
  font-size: 0.75rem;
}

.validation-error {
  background-color: #FEE2E2;
  border: 1px solid #EF4444;
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #991B1B;
}

.warning-status-info {
  background-color: #F3F4F6;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  padding: 1rem;
  margin-top: 1rem;
}

.warning-status-info h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  color: var(--q-text-primary);
}

.status-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.status-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.status-label {
  font-size: 0.875rem;
  color: var(--q-text-secondary);
}

.status-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--q-text-primary);
}
</style>
