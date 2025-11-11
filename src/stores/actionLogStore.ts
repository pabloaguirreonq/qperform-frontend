import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ActionLog } from '../types'
import { fetchActionLog, createAction, deleteAction, checkDuplicateAction } from '../services/api'

export const useActionLogStore = defineStore('actionLog', () => {
  // State
  const actions = ref<ActionLog[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  async function loadActionLog() {
    try {
      loading.value = true
      error.value = null
      const data = await fetchActionLog()
      actions.value = data
    } catch (err) {
      console.error('Error fetching action log:', err)
      error.value = 'Failed to load action history. Check API connection.'
    } finally {
      loading.value = false
    }
  }

  async function addAction(action: Omit<ActionLog, 'id'>): Promise<{ success: boolean; id: number }> {
    try {
      const result = await createAction(action)
      await loadActionLog() // Reload the list
      return result
    } catch (err) {
      console.error('Error creating action:', err)
      throw err
    }
  }

  async function removeAction(actionId: number): Promise<{ success: boolean; message: string }> {
    try {
      const result = await deleteAction(actionId)
      await loadActionLog() // Reload the list
      return result
    } catch (err) {
      console.error('Error deleting action:', err)
      throw err
    }
  }

  async function checkDuplicate(
    agentEmail: string,
    weekStartDate: Date,
    weekEndDate: Date
  ): Promise<{ exists: boolean; action?: any }> {
    try {
      return await checkDuplicateAction(agentEmail, weekStartDate, weekEndDate)
    } catch (err) {
      console.error('Error checking duplicate action:', err)
      throw err
    }
  }

  return {
    // State
    actions,
    loading,
    error,
    // Actions
    loadActionLog,
    addAction,
    removeAction,
    checkDuplicate,
  }
})
