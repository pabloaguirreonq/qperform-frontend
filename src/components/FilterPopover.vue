
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
        <div v-for="(options, key) in filterOptions" :key="key" class="filter-group">
          <label :for="`filter-${key}`">{{ formatFilterLabel(key) }}</label>
          <Dropdown
            v-if="isDropdown(key)"
            :id="`filter-${key}`"
            :options="options"
            :model-value="internalFilters[key]"
            @update:model-value="updateFilter(key, $event)"
            placeholder="Select"
            showClear
            class="w-full"
          />
          <!-- Add other filter types here if needed -->
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
  filterOptions: Record<string, any[]>;
  currentFilters: Record<string, any>;
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

const updateFilter = (key: string, value: any) => {
  internalFilters.value[key] = value;
};

const applyFilters = () => {
  emit('update:filters', { ...internalFilters.value });
  op.value.hide();
};

const clearFilters = () => {
  const clearedFilters: Record<string, any> = {};
  for (const key in internalFilters.value) {
    clearedFilters[key] = null; // or empty string/array depending on filter type
  }
  internalFilters.value = clearedFilters;
  emit('update:filters', { ...internalFilters.value });
  op.value.hide();
};

const formatFilterLabel = (key: string) => {
  return key.charAt(0).toUpperCase() + key.slice(1);
};

const isDropdown = (key: string) => {
    return ['month', 'year'].includes(key);
}

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
