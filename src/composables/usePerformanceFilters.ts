
import { ref, readonly, type DeepReadonly } from 'vue';

/**
 * Shared composable for managing performance filters across all views.
 * This acts as a simple state management solution for filter synchronization.
 */

interface Filters {
  month: string;
  year: string;
}

interface FilterOptions {
  months: string[];
  years: (string | number)[];
}

// Shared reactive state across all component instances
const filters = ref<Filters>({
  month: '',
  year: ''
});

const filterOptions = ref<FilterOptions>({
  months: [],
  years: []
});

const filtersInitialized = ref(false);

export function usePerformanceFilters() {
  const setFilters = (newFilters: Partial<Filters>) => {
    filters.value = { ...filters.value, ...newFilters };
  };

  const setFilterOptions = (options: FilterOptions) => {
    filterOptions.value = {
      months: options.months || [],
      years: options.years || []
    };
  };

  const markFiltersInitialized = () => {
    filtersInitialized.value = true;
  };

  const resetFilters = () => {
    filters.value = {
      month: '',
      year: ''
    };
  };

  return {
    filters: readonly(filters) as DeepReadonly<typeof filters>,
    filterOptions: readonly(filterOptions) as DeepReadonly<typeof filterOptions>,
    filtersInitialized: readonly(filtersInitialized),
    setFilters,
    setFilterOptions,
    markFiltersInitialized,
    resetFilters
  };
}
