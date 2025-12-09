
<template>
  <div class="filter-popover">
    <Button
      icon="pi pi-filter"
      label="Filters"
      @click="toggle"
      outlined
      :class="{ 'p-button-info': hasActiveFilters }"
    />
    <OverlayPanel ref="op" appendTo="body">
      <div class="filter-panel">
        <h4>Filters</h4>

        <!-- Month Filter -->
        <div v-if="filterOptions.months && filterOptions.months.length > 0" class="filter-group">
          <label for="filter-month">Month</label>
          <Dropdown
            id="filter-month"
            :options="[...filterOptions.months]"
            v-model="internalFilters.month"
            @update:model-value="updateFilter('month', $event)"
            placeholder="Select Month"
            showClear
            class="w-full"
          />
        </div>

        <!-- Year Filter -->
        <div v-if="filterOptions.years && filterOptions.years.length > 0" class="filter-group">
          <label for="filter-year">Year</label>
          <Dropdown
            id="filter-year"
            :options="[...filterOptions.years]"
            v-model="internalFilters.year"
            @update:model-value="updateFilter('year', $event)"
            placeholder="Select Year"
            showClear
            class="w-full"
          />
        </div>

        <div class="filter-actions">
          <Button label="Clear" text @click="clearFilters" />
          <Button label="Apply" @click="applyFilters" />
        </div>
      </div>
    </OverlayPanel>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import Button from 'primevue/button';
import OverlayPanel from 'primevue/overlaypanel';
import Dropdown from 'primevue/dropdown';

const props = defineProps<{
  filterOptions: {
    readonly months: readonly string[];
    readonly years: readonly (string | number)[];
  };
  currentFilters: {
    month: string;
    year: string;
  };
}>();

const emit = defineEmits(['update:filters']);

const op = ref();
const internalFilters = ref({ ...props.currentFilters });

watch(() => props.currentFilters, (newFilters) => {
  internalFilters.value = { ...newFilters };
}, { deep: true });

const hasActiveFilters = computed(() => {
  // A simple check if any filter has a non-empty value
  return Object.values(props.currentFilters).some(value => value);
});

const toggle = (event: any) => {
  op.value.toggle(event);
};

const updateFilter = (key: 'month' | 'year', value: any) => {
  internalFilters.value[key] = value;
};

const applyFilters = () => {
  emit('update:filters', { ...internalFilters.value });
  op.value.hide();
};

const clearFilters = () => {
  internalFilters.value = {
    month: '',
    year: ''
  };
  emit('update:filters', { ...internalFilters.value });
  op.value.hide();
};

</script>

<style scoped>
.filter-popover {
  position: relative;
}
.filter-panel {
  padding: 1rem;
  width: 250px;
}
.filter-group {
  margin-bottom: 1rem;
}
.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}
.filter-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
}
</style>
