<template>
  <div class="app-container">
    <!-- Welcome Screen -->
    <WelcomeView v-if="authStore.appState === 'welcome'" @enter="handleEnterDashboard" />

    <!-- Loading/Authenticating Screen -->
    <div v-else-if="authStore.appState === 'authenticating'" class="authenticating-screen">
      <ProgressSpinner strokeWidth="4" style="width: 60px; height: 60px" />
      <p class="authenticating-text">Authenticating...</p>
      <p class="authenticating-subtext">Verifying your OnQ credentials...</p>
    </div>

    <!-- Access Denied Screen -->
    <AccessDenied
      v-else-if="authStore.appState === 'denied'"
      :user="authStore.user"
      @go-back="authStore.goToWelcome"
    />

    <!-- Main Application (Router View) -->
    <router-view v-else />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/authStore'
import WelcomeView from './views/WelcomeView.vue'
import AccessDenied from './views/AccessDenied.vue'
import ProgressSpinner from 'primevue/progressspinner'

const router = useRouter()
const authStore = useAuthStore()

const handleEnterDashboard = async () => {
  // Set authenticating state while verifying user
  authStore.appState = 'authenticating'

  await authStore.authenticate()

  if (authStore.isAuthorized) {
    router.push('/performance')
  }
}

onMounted(async () => {
  // Handle Microsoft redirect response (if user just logged in)
  const { handleRedirectResponse, checkExistingSession } = await import('./services/authService')

  // Check if we're in mock mode
  const AUTH_MODE = import.meta.env.VITE_AUTH_MODE || 'qsoftware'

  // In mock mode, automatically authenticate without showing welcome screen
  if (AUTH_MODE === 'mock') {
    console.log('🔧 Mock mode detected - Auto-authenticating and bypassing login...')
    authStore.appState = 'authenticating'
    await authStore.authenticate()
    if (authStore.isAuthorized) {
      router.push('/performance')
      return
    }
  }

  // First, handle any redirect response from Microsoft
  const redirectHandled = await handleRedirectResponse()

  if (redirectHandled) {
    // User just logged in via redirect, authenticate them
    authStore.appState = 'authenticating'
    await authStore.authenticate()
    if (authStore.isAuthorized) {
      router.push('/performance')
      return
    }
  }

  // Check if user has an existing MSAL session
  const hasSession = await checkExistingSession()

  if (hasSession) {
    // User is already logged in, authenticate them
    await authStore.authenticate()
    if (authStore.isAuthorized) {
      router.push('/performance')
      return
    }
  }

  // Reset to welcome on mount
  authStore.goToWelcome()
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: var(--q-bg-secondary);
}

.authenticating-screen {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  gap: 16px;
  background-color: var(--q-bg-primary);
}

.authenticating-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--q-text-primary);
  margin: 0;
}

.authenticating-subtext {
  color: var(--q-text-secondary);
  margin: 0;
}
</style>
