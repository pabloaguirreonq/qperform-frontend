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
  // If not using mock auth, trigger Microsoft login first
  const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH === 'true'

  if (!useMockAuth) {
    // For Microsoft auth, the authenticate() function will handle the popup login
    authStore.appState = 'authenticating'
  }

  await authStore.authenticate()

  if (authStore.isAuthorized) {
    router.push('/performance')
  }
}

onMounted(async () => {
  // Check if we have a token in the URL (redirected from backend)
  const { verifyTokenFromUrl } = await import('./services/authService')
  const tokenVerified = await verifyTokenFromUrl()

  if (tokenVerified) {
    // Token was verified, authenticate the user
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
  background-color: #f5f5f5;
}

.authenticating-screen {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  gap: 16px;
}

.authenticating-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.authenticating-subtext {
  color: #666;
  margin: 0;
}
</style>
