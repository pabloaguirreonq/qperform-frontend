<template>
  <div class="underperforming-view">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <ProgressSpinner strokeWidth="4" style="width: 60px; height: 60px" />
      <p>Loading performance data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: #d32f2f"></i>
      <p>{{ error }}</p>
      <Button label="Retry" @click="loadData" outlined />
    </div>

    <!-- Main Content -->
    <div v-else class="content">
      <!-- Filters Section -->
      <div class="filters-section">
        <FilterPopover
          :filter-options="filterOptions"
          :current-filters="filters"
          @update:filters="handleFiltersUpdate"
        />

        <Button
          v-if="canTakeAction"
          label="Take Action"
          icon="pi pi-plus"
          severity="success"
          @click="showTakeActionDialog = true"
        />
        <Button
          v-else
          label="Take Action"
          icon="pi pi-plus"
          severity="success"
          disabled
          :title="`Your role does not have permission to take action.`"
        />
      </div>

      <!-- Tab Navigation -->
      <div class="tab-section">
        <Button
          :label="`Employee View (${employeeList.length})`"
          :outlined="viewMode !== 'employee'"
          @click="viewMode = 'employee'"
        />
        <Button
          label="Client Summary"
          :outlined="viewMode !== 'client'"
          @click="viewMode = 'client'"
        />
      </div>

      <!-- No Data Message -->
      <div v-if="groupedData.size === 0" class="no-data">
        <p>No performance data found for the selected filters.</p>
        <small>Try adjusting your filter criteria</small>
      </div>

      <!-- Employee Grid View -->
      <div v-else-if="viewMode === 'employee'" class="employee-grid-view">
        <!-- Pagination Header -->
        <div class="pagination-header">
          <Button
            label="Previous"
            icon="pi pi-chevron-left"
            text
            :disabled="currentPage === 1"
            @click="currentPage--"
          />
          <span class="pagination-info">
            Page {{ currentPage }} of {{ totalPages }} ({{ paginatedAgents.start + 1 }}-{{ paginatedAgents.end }} of {{ totalAgents }})
          </span>
          <Button
            label="Next"
            icon="pi pi-chevron-right"
            iconPos="right"
            text
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          />
        </div>

        <Card class="data-grid-card">
          <template #content>
            <div class="grid-scroll-container">
              <div class="custom-grid-container" :style="gridColumnsStyle">
                <!-- Header Row -->
                <div class="grid-header-row">
                  <div class="grid-header-cell employee-list-header">Employee List</div>
                  <div
                    v-for="(week, index) in weekHeaders"
                    :key="`week-${index}`"
                    class="grid-header-cell week-header"
                  >
                    <div class="week-header-content">
                      <div class="week-title">{{ week.formattedRange }}</div>
                      <div class="week-subheader">
                        <div class="sub-col">Weekly Score</div>
                        <div class="sub-col">Action Taken</div>
                      </div>
                    </div>
                  </div>
                  <div class="grid-header-cell">Monthly Results</div>
                </div>

                <!-- Agent Rows (Paginated) -->
                <template v-for="agentKey in paginatedAgentKeys" :key="agentKey">
                  <div class="grid-data-row">
                    <!-- Agent Info Cell -->
                    <div class="grid-cell employee-cell">
                      <div class="employee-info">
                        <Avatar
                          :label="getAgentInitials(agentKey)"
                          shape="circle"
                          size="large"
                          :style="{ backgroundColor: getAvatarColor(agentKey), color: 'white' }"
                        />
                        <div class="employee-details">
                          <div class="employee-name">{{ getAgentName(agentKey) }}</div>
                          <div class="employee-email">{{ getAgentEmail(agentKey) }}</div>
                        </div>
                      </div>
                    </div>

                    <!-- Week Performance Cells -->
                    <template v-for="(week, weekIndex) in weekHeaders" :key="`${agentKey}-week-${weekIndex}`">
                      <div class="grid-cell week-cell">
                        <div v-if="getWeekData(agentKey, week.weekRange)" class="week-cell-split">
                          <!-- Weekly Score Section -->
                          <div class="score-section">
                            <!-- Show only the first record's KPI (matching React implementation) -->
                            <PerformanceScoreBadge
                              v-if="getWeekData(agentKey, week.weekRange)?.[0]"
                              :flag="getWeekData(agentKey, week.weekRange)![0].flag_qa"
                              :kpi="getWeekData(agentKey, week.weekRange)![0].kpi_qa"
                            />
                          </div>

                          <!-- Action Taken Section -->
                          <div class="action-section">
                            <span
                              :class="getActionCount(agentKey, week.weekRange) > 0 ? 'action-yes' : 'action-no'"
                            >
                              {{ getActionStatusText(getActionCount(agentKey, week.weekRange)) }}
                            </span>
                          </div>
                        </div>
                        <div v-else class="week-cell-split empty-week">
                          <div class="score-section">-</div>
                          <div class="action-section">-</div>
                        </div>
                      </div>
                    </template>

                    <!-- Monthly Results Cell -->
                    <div class="grid-cell results-cell">
                      <div class="monthly-results">
                        <div class="result-row">
                          <span class="result-label">Score:</span>
                          <span class="result-value">
                            {{ getMonthlyResults(agentKey).compliantWeeks > 0 ? Math.floor((getMonthlyResults(agentKey).compliantWeeks / getMonthlyResults(agentKey).totalWeeks) * 5) : 0 }}/5
                          </span>
                        </div>
                        <div class="result-row">
                          <span class="result-label">Actions:</span>
                          <span class="result-value">
                            {{ getMonthlyResults(agentKey).actionCount }}/3
                          </span>
                        </div>
                        <Button
                          icon="pi pi-eye"
                          label="View Actions"
                          rounded
                          text
                          severity="info"
                          size="small"
                          @click="openViewActions(agentKey)"
                          style="margin-top: 8px"
                        />
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Client Summary View -->
      <div v-else class="client-summary-view">
        <DataTable
          :value="clientSummaryData"
          :paginator="true"
          :rows="10"
          stripedRows
          showGridlines
        >
          <Column field="client" header="Client" sortable style="min-width: 150px"></Column>
          <Column field="total_aftes" header="Total AFTEs" sortable style="min-width: 120px"></Column>
          <Column field="underperformers" header="Underperformers" sortable style="min-width: 150px"></Column>
          <Column field="weeks_with_issues" header="Weeks with Issues" sortable style="min-width: 150px"></Column>
          <Column field="avg_score" header="Avg Score" sortable style="min-width: 120px">
            <template #body="slotProps">
              <Tag
                :value="`${slotProps.data.avg_score.toFixed(1)}%`"
                :severity="getScoreSeverity(slotProps.data.avg_score)"
              />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Dialogs -->
    <RecommendationsDialog
      v-model:visible="showRecommendationsDialog"
      :agent-name="selectedAgentName"
      :monthly-results="selectedMonthlyResults"
      :recommendation="selectedRecommendation"
    />

    <TakeActionDialog
      v-model:visible="showTakeActionDialog"
      :employees="employeeList"
      :week-ranges="weekRanges"
      :pre-selected-employee="selectedAgentId"
      @action-success="handleActionSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useUserRole } from '@/composables/useUserRole'
import { usePerformanceFilters } from '@/composables/usePerformanceFilters'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Avatar from 'primevue/avatar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'
import FilterPopover from '@/components/FilterPopover.vue'
import PerformanceScoreBadge from '@/components/PerformanceScoreBadge.vue'
import RecommendationsDialog from '@/components/RecommendationsDialog.vue'
import TakeActionDialog from '@/components/TakeActionDialog.vue'
import {
  fetchPerformanceData,
  fetchFilters,
  fetchActionLog,
  fetchClientSummary,
  groupByWeek,
  calculateAgentMonthlyResults,
  generateRecommendation
} from '@/services/api'
import type {
  PerformanceData,
  ActionLog,
  ClientSummaryData
} from '@/types'

// User permissions
const { canTakeAction } = useUserRole()

// Shared filters across all performance tabs
const { filters, filterOptions, filtersInitialized, setFilters, setFilterOptions, markFiltersInitialized } = usePerformanceFilters()

// State
const loading = ref(true)
const error = ref<string | null>(null)
const viewMode = ref<'employee' | 'client'>('employee')
const rawData = ref<PerformanceData[]>([])
const groupedData = ref<Map<string, Map<string, PerformanceData[]>>>(new Map())
const actionLogData = ref<ActionLog[]>([])
const clientSummaryData = ref<ClientSummaryData[]>([])

// Pagination state
const currentPage = ref(1)
const itemsPerPage = 7

// Dialog state
const showRecommendationsDialog = ref(false)
const showTakeActionDialog = ref(false)
const selectedAgentId = ref('')
const selectedAgentName = ref('')
const selectedMonthlyResults = ref({ compliantWeeks: 0, totalWeeks: 0, actionCount: 0 })
const selectedRecommendation = ref({ action: '', isCritical: false, notes: '' })

// Computed: Employee list
const employeeList = computed(() => {
  return Array.from(groupedData.value.keys()).map(key => {
    const weeksMap = groupedData.value.get(key)
    const firstRecord = weeksMap ? Array.from(weeksMap.values())[0]?.[0] : null

    return {
      id: key,
      name: firstRecord?.agent_name || firstRecord?.agent_email?.split('@')[0] || 'Unknown',
      email: firstRecord?.agent_email || key
    }
  })
})

// Computed: Pagination
const totalAgents = computed(() => Array.from(groupedData.value.keys()).length)
const totalPages = computed(() => Math.ceil(totalAgents.value / itemsPerPage))

const paginatedAgents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = Math.min(start + itemsPerPage, totalAgents.value)
  return { start, end }
})

const paginatedAgentKeys = computed(() => {
  const allKeys = Array.from(groupedData.value.keys())
  const { start, end } = paginatedAgents.value
  return allKeys.slice(start, end)
})

// Computed: Week ranges for take action dialog
const weekRanges = computed(() => {
  const uniqueWeeks = new Map<string, { start_date: string; end_date: string; week_range: string }>()

  rawData.value.forEach(record => {
    const key = `${record.start_date}_${record.end_date}`
    if (!uniqueWeeks.has(key)) {
      uniqueWeeks.set(key, {
        start_date: record.start_date,
        end_date: record.end_date,
        week_range: record.week_range
      })
    }
  })

  // Sort by start_date descending (most recent first)
  return Array.from(uniqueWeeks.values()).sort((a, b) =>
    new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  )
})

// Helper function to format date in "Sep 20, 2025" format
const formatDateShort = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Helper function to format week range
const formatWeekRange = (startDate: string, endDate: string): string => {
  return `${formatDateShort(startDate)} - ${formatDateShort(endDate)}`
}

// Computed: Week headers
const weekHeaders = computed(() => {
  const allWeeksSet = new Set<string>()
  groupedData.value.forEach(weeksMap => {
    weeksMap.forEach((_, weekRange) => allWeeksSet.add(weekRange))
  })

  const uniqueWeeks = Array.from(allWeeksSet).sort((a, b) => {
    const weekA = rawData.value.find(d => d.week_range === a)
    const weekB = rawData.value.find(d => d.week_range === b)
    if (!weekA || !weekB) return 0
    return new Date(weekA.start_date).getTime() - new Date(weekB.start_date).getTime()
  })

  return uniqueWeeks.map(weekRange => {
    const weekData = rawData.value.find(d => d.week_range === weekRange)
    return {
      weekRange,
      startDate: weekData?.start_date || '',
      endDate: weekData?.end_date || '',
      formattedRange: formatWeekRange(weekData?.start_date || '', weekData?.end_date || '')
    }
  })
})

// Computed: Grid columns style
const gridColumnsStyle = computed(() => {
  return {
    gridTemplateColumns: `250px repeat(${weekHeaders.value.length}, minmax(180px, 1fr)) 200px`
  }
})

// Helper functions
const getAgentName = (agentKey: string) => {
  const agent = employeeList.value.find(a => a.id === agentKey)
  return agent?.name || 'Unknown'
}

const getAgentEmail = (agentKey: string) => {
  const agent = employeeList.value.find(a => a.id === agentKey)
  return agent?.email || agentKey
}

const getAgentInitials = (agentKey: string) => {
  const name = getAgentName(agentKey)
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return parts[0][0] + parts[parts.length - 1][0]
  }
  return name.substring(0, 2).toUpperCase()
}

const getAvatarColor = (agentKey: string) => {
  const colors = ['#005a9e', '#0078d4', '#8764b8', '#ca5010', '#038387', '#8764b8']
  const index = agentKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  return colors[index]
}

const getWeekData = (agentKey: string, weekRange: string): PerformanceData[] | undefined => {
  const weeksMap = groupedData.value.get(agentKey)
  return weeksMap?.get(weekRange)
}

const getActionCount = (agentKey: string, weekRange: string): number => {
  const weekData = getWeekData(agentKey, weekRange)
  if (!weekData || weekData.length === 0) return 0

  const agent = employeeList.value.find(a => a.id === agentKey)
  const agentEmail = agent?.email

  if (!agentEmail) return 0

  // Get the week start/end dates
  const firstRecord = weekData[0]
  const weekStartDate = new Date(firstRecord.start_date)
  const weekEndDate = new Date(firstRecord.end_date)

  // Count actions that match this week (matching React implementation)
  return actionLogData.value.filter(action => {
    if (action.agent_email !== agentEmail) return false

    // If action has week_start_date and week_end_date, match by those
    if (action.week_start_date && action.week_end_date) {
      const actionWeekStart = new Date(action.week_start_date)
      const actionWeekEnd = new Date(action.week_end_date)
      return actionWeekStart.getTime() === weekStartDate.getTime() &&
             actionWeekEnd.getTime() === weekEndDate.getTime()
    }

    // Fallback: match by action_date if week dates not available
    const actionDate = new Date(action.action_date)
    return actionDate >= weekStartDate && actionDate <= weekEndDate
  }).length
}

const getActionStatusText = (actionCount: number): string => {
  return actionCount > 0
    ? `${actionCount} Action${actionCount > 1 ? 's' : ''}`
    : 'No Action'
}

const getMonthlyResults = (agentKey: string) => {
  const weeksMap = groupedData.value.get(agentKey)
  const agent = employeeList.value.find(a => a.id === agentKey)
  const agentEmail = agent?.email || agentKey

  if (!weeksMap) {
    return { compliantWeeks: 0, totalWeeks: 0, actionCount: 0 }
  }

  return calculateAgentMonthlyResults(weeksMap, agentEmail, actionLogData.value)
}

const getScoreSeverity = (score: number): 'success' | 'warning' | 'danger' => {
  if (score >= 90) return 'success'
  if (score >= 75) return 'warning'
  return 'danger'
}

const openRecommendations = (agentKey: string) => {
  const agent = employeeList.value.find(a => a.id === agentKey)
  const monthlyResults = getMonthlyResults(agentKey)
  const recommendation = generateRecommendation(monthlyResults)

  selectedAgentId.value = agentKey
  selectedAgentName.value = agent?.name || 'Unknown'
  selectedMonthlyResults.value = monthlyResults
  selectedRecommendation.value = recommendation
  showRecommendationsDialog.value = true
}

const openTakeAction = (agentKey: string) => {
  const agent = employeeList.value.find(a => a.id === agentKey)
  selectedAgentId.value = agentKey
  selectedAgentName.value = agent?.name || 'Unknown'
  showTakeActionDialog.value = true
}

const openViewActions = (agentKey: string) => {
  const agent = employeeList.value.find(a => a.id === agentKey)
  selectedAgentId.value = agentKey
  selectedAgentName.value = agent?.name || 'Unknown'
  // For now, open the recommendations dialog
  // In the future, you can create a separate ViewActionsDialog component
  openRecommendations(agentKey)
}

const handleActionSuccess = () => {
  // Reload data after action is created
  loadData()
}

// Data loading
const loadData = async () => {
  if (!filters.value.month || !filters.value.year) {
    loading.value = false
    return
  }

  try {
    loading.value = true
    error.value = null

    const [performanceData, logData, clientData] = await Promise.all([
      fetchPerformanceData(filters.value),
      fetchActionLog(),
      fetchClientSummary(filters.value)
    ])

    const grouped = groupByWeek(performanceData)

    rawData.value = performanceData
    groupedData.value = grouped
    actionLogData.value = logData
    clientSummaryData.value = clientData

    loading.value = false
  } catch (err) {
    console.error('Error fetching data:', err)
    error.value = 'Failed to load performance data. Check API server and network.'
    loading.value = false
  }
}

const handleFiltersUpdate = (newFilters: any) => {
  setFilters(newFilters)
}

// Load filter options on mount
onMounted(async () => {
  try {
    const options = await fetchFilters()
    setFilterOptions(options)

    // Only initialize filters if they haven't been initialized yet
    if (!filtersInitialized.value) {
      // Auto-select current month/year
      const now = new Date()
      const currentMonthName = now.toLocaleString('en-US', { month: 'long' })
      const currentYear = now.getFullYear()

      const monthToUse = options.months.find(m =>
        m.trim().toLowerCase() === currentMonthName.toLowerCase()
      )
      const yearToUse = options.years.includes(currentYear) ? currentYear : options.years[0]

      setFilters({
        month: monthToUse || options.months[options.months.length - 1],
        year: String(yearToUse)
      })
      markFiltersInitialized()
    } else {
      // Filters already initialized, just load data with existing filters
      if (filters.value.month && filters.value.year) {
        loadData()
      }
    }
  } catch (err) {
    console.error('Failed to load filter options', err)
    loading.value = false
  }
})

// Watch filters and reload data
watch(filters, (newFilters) => {
  if (newFilters.month && newFilters.year) {
    currentPage.value = 1 // Reset to first page when filters change
    loadData()
  }
}, { deep: true })
</script>

<style scoped>
.underperforming-view {
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

.tab-section {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.no-data {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.no-data small {
  display: block;
  margin-top: 8px;
  font-size: 14px;
}

/* Pagination Header */
.pagination-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  margin-bottom: 12px;
}

.pagination-info {
  font-size: 14px;
  color: #666;
}

/* Grid Card */
.data-grid-card {
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
}

.grid-scroll-container {
  max-height: 650px;
  overflow-y: auto;
  overflow-x: auto;
}

.custom-grid-container {
  display: grid;
  gap: 0;
  min-width: max-content;
}

.grid-header-row,
.grid-data-row {
  display: contents;
}

/* Header Cells */
.grid-header-cell {
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  padding: 16px 12px;
  font-weight: 600;
  font-size: 14px;
  position: sticky;
  top: 0;
  z-index: 10;
  text-align: center;
}

.employee-list-header {
  text-align: left;
}

.week-header-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.week-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.week-subheader {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #d0d0d0;
}

.sub-col {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: #555;
}

/* Data Cells */
.grid-cell {
  border: 1px solid #e0e0e0;
  padding: 12px;
  background: white;
  min-height: 70px;
}

.employee-cell {
  position: sticky;
  left: 0;
  z-index: 5;
  background: white;
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.employee-details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.employee-name {
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.employee-email {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Week Cell Split Layout */
.week-cell {
  padding: 8px;
}

.week-cell-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  height: 100%;
}

.score-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: center;
  align-items: center;
  padding: 4px;
}

.action-section {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem; /* Matches React */
  font-weight: 600;
  padding: 4px;
}

.action-yes {
  color: #2e7d32; /* Green - matches React */
}

.action-no {
  color: #f57c00; /* Orange - matches React (not red) */
}

.empty-week {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.empty-week .score-section,
.empty-week .action-section {
  color: #999;
  font-size: 12px;
}

/* Monthly Results Cell */
.results-cell {
  position: sticky;
  right: 0;
  z-index: 5;
  background: white;
}

.monthly-results {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.result-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  width: 100%;
  justify-content: center;
}

.result-label {
  color: #666;
  font-weight: 500;
}

.result-value {
  color: #333;
  font-weight: 600;
  font-size: 14px;
}
</style>
