import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserProfile, UserRole, UserPermissions, AppState } from '../types'
import { authenticateUser, getUserPermissions } from '../services/authService'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<UserProfile | null>(null)
  const role = ref<UserRole | null>(null)
  const isLoading = ref(false)
  const isAuthorized = ref(false)
  const appState = ref<AppState>('welcome')

  // Computed
  const permissions = computed<UserPermissions>(() => {
    if (!role.value || role.value === 'Unauthorized') {
      return {
        canTakeAction: false,
        canViewReports: false,
        canViewAllClients: false,
        receivesNotifications: false,
      }
    }
    return getUserPermissions(role.value)
  })

  const canTakeAction = computed(() => permissions.value.canTakeAction)
  const receivesNotifications = computed(() => permissions.value.receivesNotifications)

  // Actions
  async function authenticate() {
    try {
      isLoading.value = true
      appState.value = 'authenticating'

      const authResult = await authenticateUser()

      user.value = authResult.user
      role.value = authResult.role
      isAuthorized.value = authResult.isAuthorized

      if (authResult.isAuthorized) {
        appState.value = 'authorized'
      } else {
        appState.value = 'denied'
      }

      console.log('Authentication complete:', {
        user: user.value?.displayName,
        role: role.value,
        authorized: isAuthorized.value,
      })
    } catch (error) {
      console.error('Authentication error:', error)
      role.value = 'Unauthorized'
      isAuthorized.value = false
      appState.value = 'denied'
    } finally {
      isLoading.value = false
    }
  }

  function goToWelcome() {
    appState.value = 'welcome'
  }

  function reset() {
    user.value = null
    role.value = null
    isLoading.value = false
    isAuthorized.value = false
    appState.value = 'welcome'
  }

  return {
    // State
    user,
    role,
    isLoading,
    isAuthorized,
    appState,
    // Computed
    permissions,
    canTakeAction,
    receivesNotifications,
    // Actions
    authenticate,
    goToWelcome,
    reset,
  }
})
