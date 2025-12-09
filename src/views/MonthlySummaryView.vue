<template>
  <div class="monthly-summary-view">
    <div v-if="loading" class="loading-state">
      <ProgressSpinner strokeWidth="4" style="width: 60px; height: 60px" />
      <p>Loading monthly summary...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: var(--q-danger)"></i>
      <p>{{ error }}</p>
      <Button label="Retry" @click="loadData" outlined />
    </div>

    <div v-else class="content">
      <!-- Filters Section -->
      <div class="filters-section">
        <FilterPopover
          :filter-options="filterOptions"
          :current-filters="filters"
          @update:filters="handleFiltersUpdate"
        />
      </div>

      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="summary-card">
          <div class="card-icon">
            <i class="pi pi-users"></i>
          </div>
          <div class="card-content">
            <h3>Total AFTEs</h3>
            <p class="card-value">{{ summaryData.overall.total_aftes }}</p>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon warning">
            <i class="pi pi-exclamation-circle"></i>
          </div>
          <div class="card-content">
            <h3>Underperforming</h3>
            <p class="card-value">{{ summaryData.overall.underperformers }}</p>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon success">
            <i class="pi pi-chart-line"></i>
          </div>
          <div class="card-content">
            <h3>Average Score</h3>
            <p class="card-value">{{ Number(summaryData.overall.avg_score || 0).toFixed(1) }}%</p>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon info">
            <i class="pi pi-percentage"></i>
          </div>
          <div class="card-content">
            <h3>Underperformer Rate</h3>
            <p class="card-value">{{ underperformerRate }}%</p>
          </div>
        </div>
      </div>

      <!-- Detailed Table Section -->
      <div class="table-section">
        <h3>Performance Details by Client & Category</h3>

        <DataTable
          :value="summaryData.details"
          :paginator="true"
          :rows="10"
          :rowsPerPageOptions="[10, 20, 50]"
          stripedRows
          showGridlines
          class="p-datatable-sm"
        >
          <Column field="client" header="Client" sortable style="min-width: 150px">
            <template #body="slotProps">
              <strong>{{ slotProps.data.client }}</strong>
            </template>
          </Column>
          <Column field="category" header="Category" sortable style="min-width: 150px"></Column>
          <Column field="total_aftes" header="Total AFTEs" sortable style="min-width: 120px" headerClass="text-right">
            <template #body="slotProps">
              <div class="text-right">{{ slotProps.data.total_aftes }}</div>
            </template>
          </Column>
          <Column field="avg_score" header="Avg Score" sortable style="min-width: 120px" headerClass="text-right">
            <template #body="slotProps">
              <div class="text-right">
                <Tag
                  :value="Number(slotProps.data.avg_score || 0).toFixed(1) + '%'"
                  :severity="getScoreSeverity(Number(slotProps.data.avg_score || 0))"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useUserRole } from '@/composables/useUserRole'
import { usePerformanceFilters } from '@/composables/usePerformanceFilters'
import { fetchMonthlySummary } from '@/services/api'
import type { MonthlySummaryResponse } from '@/types'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import FilterPopover from '@/components/FilterPopover.vue'

// User role and permissions
const { role, assignedClients } = useUserRole()

// Shared filters across all performance tabs
const { filters, filterOptions, setFilters } = usePerformanceFilters()

// State
const loading = ref(true)
const error = ref<string | null>(null)
const rawSummaryData = ref<MonthlySummaryResponse>({
  overall: {
    total_aftes: 0,
    underperformers: 0,
    avg_score: 0
  },
  details: []
})

// Check if user has full access (Directors and AVPs)
const hasFullAccess = computed(() => {
  return role.value === 'Director' || role.value === 'AVP'
})

// Apply role-based filtering to summary data
const summaryData = computed(() => {
  if (hasFullAccess.value || !role.value || role.value === 'Unauthorized') {
    return rawSummaryData.value
  }

  // Filter details by assigned clients
  const clientFilter = assignedClients.value.map(c => c.toLowerCase())

  if (clientFilter.length === 0) {
    return {
      overall: {
        total_aftes: 0,
        underperformers: 0,
        avg_score: 0
      },
      details: []
    }
  }

  const filteredDetails = rawSummaryData.value.details.filter((detail: any) =>
    clientFilter.includes(detail.client.toLowerCase())
  )

  // Recalculate overall stats based on filtered details
  const totalAftes = filteredDetails.reduce((sum: number, d: any) => sum + d.total_aftes, 0)
  const avgScore = filteredDetails.length > 0
    ? filteredDetails.reduce((sum: number, d: any) => sum + d.avg_score, 0) / filteredDetails.length
    : 0

  console.log(`🔒 Monthly summary filtered: ${rawSummaryData.value.details.length} → ${filteredDetails.length} clients`)

  return {
    overall: {
      total_aftes: totalAftes,
      underperformers: Math.floor(totalAftes * (1 - avgScore / 100)), // Approximate
      avg_score: Math.round(avgScore * 10) / 10
    },
    details: filteredDetails
  }
})

const underperformerRate = computed(() => {
  const total = summaryData.value.overall.total_aftes
  const underperformers = summaryData.value.overall.underperformers
  return total > 0 ? ((underperformers / total) * 100).toFixed(1) : '0.0'
})

const getScoreSeverity = (score: number): 'success' | 'warning' | 'danger' => {
  if (score >= 90) return 'success'
  if (score >= 75) return 'warning'
  return 'danger'
}

const handleFiltersUpdate = (newFilters: any) => {
  setFilters(newFilters)
}

// Load data
const loadData = async () => {
  if (!filters.value.month || !filters.value.year) {
    loading.value = false
    return
  }

  loading.value = true
  error.value = null

  try {
    const data = await fetchMonthlySummary(filters.value)
    rawSummaryData.value = data
    loading.value = false
  } catch (err) {
    console.error('Error loading monthly summary:', err)
    error.value = 'Failed to load monthly summary. Please try again.'
    loading.value = false
  }
}

// Load data when mounted or when filters change
onMounted(() => {
  if (filters.value.month && filters.value.year) {
    loadData()
  }
})

// Watch filters and reload data
watch(filters, (newFilters) => {
  if (newFilters.month && newFilters.year) {
    loadData()
  }
}, { deep: true })
</script>

<style scoped>
.monthly-summary-view {
  padding: 20px;
}

.filters-section {
  margin-bottom: 20px;
}

.view-header {
  margin-bottom: 24px;
}

.view-header h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--q-text-primary);
}

.description {
  margin: 0;
  color: var(--q-text-secondary);
  font-size: 14px;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.summary-card {
  background: var(--q-bg-primary);
  border: 1px solid var(--q-border);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  gap: 16px;
  align-items: center;
  box-shadow: var(--q-shadow-sm);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--q-secondary-lighter);
  color: var(--q-secondary);
  font-size: 24px;
}

.card-icon.warning {
  background-color: var(--q-primary-lighter);
  color: var(--q-primary-dark);
}

.card-icon.success {
  background-color: rgba(34, 197, 94, 0.1);
  color: var(--q-success);
}

.card-icon.info {
  background-color: var(--q-secondary-lighter);
  color: var(--q-info);
}

.card-content h3 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--q-text-secondary);
}

.card-value {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--q-text-primary);
}

.table-section {
  background: var(--q-bg-primary);
  border: 1px solid var(--q-border);
  border-radius: 8px;
  padding: 24px;
  box-shadow: var(--q-shadow-sm);
}

.table-section h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: var(--q-text-secondary);
  font-size: 14px;
  margin: 0;
}
</style>
