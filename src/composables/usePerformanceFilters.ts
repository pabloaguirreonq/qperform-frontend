
import { ref, readonly } from 'vue';

// This is a simplified, shared store for filters.
// In a real app, you might use Pinia or another state management library.

const filters = ref({
  month: '',
  year: '',
  // Add other filters as needed, e.g., client: [], team: []
});

const filterOptions = ref({
  months: [],
  years: [],
  // Add other filter options as needed
});

const filtersInitialized = ref(false);

export function usePerformanceFilters() {
  const setFilters = (newFilters: any) => {
    filters.value = { ...filters.value, ...newFilters };
  };

  const setFilterOptions = (options: any) => {
    filterOptions.value = options;
  };

  const markFiltersInitialized = () => {
    filtersInitialized.value = true;
  };

  return {
    filters: readonly(filters),
    filterOptions: readonly(filterOptions),
    filtersInitialized: readonly(filtersInitialized),
    setFilters,
    setFilterOptions,
    markFiltersInitialized,
  };
}
