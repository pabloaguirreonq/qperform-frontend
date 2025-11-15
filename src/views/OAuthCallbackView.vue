<template>
  <div class="callback-container">
    <ProgressSpinner strokeWidth="4" style="width: 60px; height: 60px" />
    <p class="callback-text">{{ message }}</p>
    <p class="callback-subtext">{{ subMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { handleOAuthCallback } from '../services/authService'
import ProgressSpinner from 'primevue/progressspinner'

const router = useRouter()
const authStore = useAuthStore()

const message = ref('Processing authentication...')
const subMessage = ref('Please wait while we complete your login')

onMounted(async () => {
  try {
    console.log('OAuth callback view mounted')

    // Handle the OAuth callback
    const success = await handleOAuthCallback()

    if (success) {
      message.value = 'Authentication successful!'
      subMessage.value = 'Verifying your credentials...'

      // Now authenticate the user with the stored tokens
      await authStore.authenticate()

      if (authStore.isAuthorized) {
        message.value = 'Welcome!'
        subMessage.value = 'Redirecting to dashboard...'

        // Small delay for user feedback
        setTimeout(() => {
          router.push('/performance')
        }, 500)
      } else {
        // User is not authorized
        message.value = 'Access Denied'
        subMessage.value = 'You do not have permission to access this application'

        setTimeout(() => {
          authStore.appState = 'denied'
          router.push('/')
        }, 1500)
      }
    } else {
      // OAuth callback failed
      message.value = 'Authentication failed'
      subMessage.value = 'Please try logging in again'

      setTimeout(() => {
        router.push('/')
      }, 2000)
    }
  } catch (error) {
    console.error('Error in OAuth callback:', error)
    message.value = 'An error occurred'
    subMessage.value = 'Please try again'

    setTimeout(() => {
      router.push('/')
    }, 2000)
  }
})
</script>

<style scoped>
.callback-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  gap: 16px;
  background-color: var(--q-bg-primary);
}

.callback-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--q-text-primary);
  margin: 0;
}

.callback-subtext {
  color: var(--q-text-secondary);
  margin: 0;
}
</style>
