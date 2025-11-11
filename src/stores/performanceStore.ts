import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PerformanceData, PerformanceFilters, FilterOptions, ClientSummaryData } from '../types'
import { fetchPerformanceData, fetchFilters, fetchClientSummary, groupByWeek } from '../services/api'

export const usePerformanceStore = defineStore('performance', () => {
  // State
  const rawData = ref<PerformanceData[]>([])
  const clientSummaryData = ref<ClientSummaryData[]>([])
  const filterOptions = ref<FilterOptions>({
    months: [],
    years: [],
    clients: [],
    categories: [],
    tasks: [],
  })
  const filters = ref<PerformanceFilters>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const groupedData = computed(() => {
    return groupByWeek(rawData.value)
  })

  const employeeList = computed(() => {
    return Array.from(groupedData.value.keys()).map(key => {
      const weeksMap = groupedData.value.get(key)
      const firstRecord = weeksMap
        ? Array.from(weeksMap.values())[0]?.[0]
        : null

      const email = firstRecord?.agent_email || key
      const name = firstRecord?.agent_name || email.split('@')[0] || 'Unknown Agent'

      return { id: key, name, email }
    })
  })

  const weekRanges = computed(() => {
    const uniqueWeeks = new Map<string, { start_date: string; end_date: string; week_range: string }>()

    rawData.value.forEach(record => {
      const key = `${record.start_date}_${record.end_date}`
      if (!uniqueWeeks.has(key)) {
        uniqueWeeks.set(key, {
          start_date: record.start_date,
          end_date: record.end_date,
          week_range: record.week_range,
        })
      }
    })

    return Array.from(uniqueWeeks.values()).sort((a, b) =>
      new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    )
  })

  // Actions
  async function loadFilterOptions() {
    try {
      const options = await fetchFilters()
      filterOptions.value = options

      // Auto-select current month/year if no filters are set
      if (!filters.value.month && options.months.length > 0) {
        const now = new Date()
        const currentMonthName = now.toLocaleString('en-US', { month: 'long' })
        const currentYear = now.getFullYear()

        const monthToUse = options.months.find(m =>
          m.trim().toLowerCase() === currentMonthName.toLowerCase()
        )

        const yearToUse = options.years.includes(currentYear)
          ? currentYear
          : options.years[0]

        const finalMonth = monthToUse || options.months[options.months.length - 1]
        const finalYear = String(yearToUse)

        filters.value = {
          month: finalMonth,
          year: finalYear,
        }
      }
    } catch (err) {
      console.error('Failed to load filter options', err)
      error.value = 'Failed to load filter options'
    }
  }

  async function loadPerformanceData(currentFilters?: PerformanceFilters) {
    const filtersToUse = currentFilters || filters.value

    if (!filtersToUse.month || !filtersToUse.year) {
      loading.value = false
      return
    }

    try {
      loading.value = true
      error.value = null

      const [performanceData, clientData] = await Promise.all([
        fetchPerformanceData(filtersToUse),
        fetchClientSummary(filtersToUse),
      ])

      rawData.value = performanceData
      clientSummaryData.value = clientData
    } catch (err) {
      console.error('Error fetching performance data:', err)
      error.value = 'Failed to load performance data. Check API server and network.'
    } finally {
      loading.value = false
    }
  }

  function setFilters(newFilters: PerformanceFilters) {
    filters.value = { ...newFilters }
  }

  function resetFilters() {
    filters.value = {}
  }

  return {
    // State
    rawData,
    clientSummaryData,
    filterOptions,
    filters,
    loading,
    error,
    // Computed
    groupedData,
    employeeList,
    weekRanges,
    // Actions
    loadFilterOptions,
    loadPerformanceData,
    setFilters,
    resetFilters,
  }
})
