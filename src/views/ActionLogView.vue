<template>
  <div class="action-log-view">
    <div v-if="loading" class="loading-state">
      <ProgressSpinner strokeWidth="4" style="width: 60px; height: 60px" />
      <p>Loading action log...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: var(--q-danger)"></i>
      <p>{{ error }}</p>
      <Button label="Retry" @click="loadActionLog" outlined />
    </div>

    <div v-else class="content">
      <!-- Filters Section -->
      <div class="filters-section">
        <FilterPopover
          :filter-options="filterOptions"
          :current-filters="filters"
          @update:filters="handleFiltersUpdate"
        />

        <Button
          label="Refresh"
          icon="pi pi-refresh"
          outlined
          @click="loadActionLog"
          :loading="loading"
        />
      </div>

      <!-- Action Log DataTable -->
      <div class="table-section">
        <p v-if="!actionLog.length" class="no-data">
          No actions have been logged yet.
        </p>

        <DataTable
          v-else
          :value="actionLog"
          :paginator="true"
          :rows="20"
          :rowsPerPageOptions="[10, 20, 50, 100]"
          stripedRows
          showGridlines
          class="p-datatable-sm"
          :sortField="'action_date'"
          :sortOrder="-1"
        >
          <Column field="action_date" header="Date" sortable style="min-width: 120px">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.action_date) }}
            </template>
          </Column>

          <Column field="agent_name" header="Agent" sortable style="min-width: 180px">
            <template #body="slotProps">
              <div class="agent-cell">
                <strong>{{ slotProps.data.agent_name || slotProps.data.agent_email }}</strong>
                <small v-if="slotProps.data.agent_name">{{ slotProps.data.agent_email }}</small>
              </div>
            </template>
          </Column>

          <Column field="action_type" header="Action Type" sortable style="min-width: 200px">
            <template #body="slotProps">
              <div class="action-type-cell">
                <Tag
                  :value="slotProps.data.action_type"
                  :severity="getActionTypeSeverity(slotProps.data.action_type)"
                />
                <Tag
                  v-if="slotProps.data.warning_type && slotProps.data.warning_type !== 'Other'"
                  :value="slotProps.data.warning_type"
                  severity="secondary"
                  size="small"
                  style="margin-left: 4px"
                />
              </div>
            </template>
          </Column>

          <Column header="Status & Expiration" sortable style="min-width: 180px">
            <template #body="slotProps">
              <div v-if="slotProps.data.expiration_date" class="expiration-cell">
                <Tag
                  :value="getExpirationStatus(slotProps.data.expiration_date, slotProps.data.is_active)"
                  :severity="getExpirationSeverity(slotProps.data.expiration_date, slotProps.data.is_active)"
                  size="small"
                />
                <small style="display: block; margin-top: 4px">
                  Expires: {{ formatDate(slotProps.data.expiration_date) }}
                </small>
              </div>
              <Tag v-else value="Permanent" severity="secondary" size="small" />
            </template>
          </Column>

          <Column field="description" header="Description" style="min-width: 300px">
            <template #body="slotProps">
              <div class="description-cell">
                {{ slotProps.data.description }}
              </div>
            </template>
          </Column>

          <Column field="client" header="Client" sortable style="min-width: 150px"></Column>

          <Column field="category" header="Category" sortable style="min-width: 150px"></Column>

          <Column field="taken_by" header="Taken By" sortable style="min-width: 150px">
            <template #body="slotProps">
              <div class="taken-by-cell">
                <i class="pi pi-user"></i>
                {{ slotProps.data.taken_by }}
              </div>
            </template>
          </Column>

          <Column header="Week" style="min-width: 180px">
            <template #body="slotProps">
              <div v-if="slotProps.data.week_start_date && slotProps.data.week_end_date" class="week-cell">
                <small>{{ formatDate(slotProps.data.week_start_date) }} - {{ formatDate(slotProps.data.week_end_date) }}</small>
              </div>
              <span v-else>-</span>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useUserRole } from '@/composables/useUserRole'
import { usePerformanceFilters } from '@/composables/usePerformanceFilters'
import { fetchActionLog } from '@/services/api'
import type { ActionLog } from '@/types'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import FilterPopover from '@/components/FilterPopover.vue'

// User role and permissions
const { role, user, assignedClients, teamMembers } = useUserRole()

// Shared filters across all performance tabs
const { filters, filterOptions, setFilters } = usePerformanceFilters()

// State
const loading = ref(true)
const error = ref<string | null>(null)
const allActionLogs = ref<ActionLog[]>([])

// Check if user has full access (Directors and AVPs)
const hasFullAccess = computed(() => {
  return role.value === 'Director' || role.value === 'AVP'
})

// Filtered action log based on month/year and role-based access
const actionLog = computed(() => {
  let filtered = allActionLogs.value

  // Apply role-based filtering
  if (!hasFullAccess.value && role.value) {
    const teamEmails = teamMembers.value.map(m => m.email?.toLowerCase()).filter(Boolean) as string[]
    const clientFilter = assignedClients.value.map(c => c.toLowerCase())

    filtered = filtered.filter((action: ActionLog) => {
      // Agents see only their own actions
      if (role.value === 'Agent' && user.value) {
        return action.agent_email.toLowerCase() === (user.value as any)?.email?.toLowerCase()
      }

      // Managers, Supervisors, Team Leads see actions for their teams or clients
      const matchesTeam = teamEmails.includes(action.agent_email.toLowerCase())
      const matchesClient = clientFilter.length === 0 || clientFilter.includes(action.client.toLowerCase())

      return matchesTeam || matchesClient
    })

    console.log(`🔒 Action log filtered by role: ${allActionLogs.value.length} → ${filtered.length} records`)
  }

  // Apply month/year filter
  if (!filters.value.month || !filters.value.year) {
    return filtered
  }

  const selectedMonth = filters.value.month.trim()
  const selectedYear = parseInt(filters.value.year)

  return filtered.filter((action: ActionLog) => {
    if (!action.week_start_date) return false

    const actionDate = new Date(action.week_start_date)
    const actionMonth = actionDate.toLocaleString('en-US', { month: 'long' })
    const actionYear = actionDate.getFullYear()

    return actionMonth === selectedMonth && actionYear === selectedYear
  })
})

// Format date helper
const formatDate = (dateString: string): string => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Get severity for action type
const getActionTypeSeverity = (actionType: string): 'success' | 'warning' | 'danger' | 'info' => {
  const type = actionType.toLowerCase()
  if (type.includes('coaching') || type.includes('counseling')) return 'info'
  if (type.includes('verbal warning')) return 'warning'
  if (type.includes('written warning')) return 'warning'
  if (type.includes('final') || type.includes('pip') || type.includes('termination')) return 'danger'
  return 'success'
}

// Get expiration status text
const getExpirationStatus = (expirationDate: string, isActive?: boolean): string => {
  if (!isActive) return 'Revoked'

  const expDate = new Date(expirationDate)
  const today = new Date()
  const daysUntilExpiration = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiration < 0) return 'Expired'
  if (daysUntilExpiration === 0) return 'Expires Today'
  if (daysUntilExpiration <= 7) return `${daysUntilExpiration} days left`
  if (daysUntilExpiration <= 30) return 'Expiring soon'
  return 'Active'
}

// Get expiration severity
const getExpirationSeverity = (expirationDate: string, isActive?: boolean): 'success' | 'warning' | 'danger' | 'secondary' => {
  if (!isActive) return 'secondary'

  const expDate = new Date(expirationDate)
  const today = new Date()
  const daysUntilExpiration = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiration < 0) return 'secondary' // Expired
  if (daysUntilExpiration <= 7) return 'danger' // Expiring very soon
  if (daysUntilExpiration <= 30) return 'warning' // Expiring soon
  return 'success' // Active
}

const handleFiltersUpdate = (newFilters: any) => {
  setFilters(newFilters)
}

// Load action log data
const loadActionLog = async () => {
  loading.value = true
  error.value = null

  try {
    const data = await fetchActionLog()
    allActionLogs.value = data
    loading.value = false
  } catch (err) {
    console.error('Error loading action log:', err)
    error.value = 'Failed to load action log. Please try again.'
    loading.value = false
  }
}

// Load data on mount
onMounted(() => {
  loadActionLog()
})
</script>

<style scoped>
.action-log-view {
  padding: 20px;
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

.filters-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
}

.table-section {
  background: var(--q-bg-primary);
  border: 1px solid var(--q-border);
  border-radius: 8px;
  padding: 24px;
  box-shadow: var(--q-shadow-sm);
}

.no-data {
  text-align: center;
  padding: 40px;
  color: var(--q-text-secondary);
  font-size: 14px;
  margin: 0;
}

.agent-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.agent-cell small {
  color: var(--q-text-secondary);
  font-size: 12px;
}

.description-cell {
  line-height: 1.4;
}

.taken-by-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.week-cell small {
  color: var(--q-text-secondary);
}

:deep(.text-right) {
  text-align: right;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 8px 12px;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  padding: 10px 12px;
  background-color: var(--q-bg-secondary);
  font-weight: 600;
}
</style>
