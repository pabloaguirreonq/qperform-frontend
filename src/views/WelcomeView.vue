<template>
  <div class="welcome-container">
    <div class="welcome-content">
      <img
        src="https://onq.global/wp-content/uploads/2025/05/OnQ_Logo_4Color-400x90.webp"
        alt="OnQ Global Logo"
        class="welcome-logo"
      />

      <h1 class="welcome-title">QPerform</h1>
      <Divider />
      <h2 class="welcome-subtitle">Performance Management Suite</h2>

      <div class="welcome-version">Version 0.1.0</div>

      <p class="welcome-description">
        This system provides leadership members with a clear, visual, and weekly review of Production and QA
        performance results across all operation employees. Our focus is on highlighting "At Risk" performance
        and providing automated, actionable recommendations to ensure continuous improvement and compliance
        with OnQ's Standards.
      </p>

      <div class="button-group">
        <Button
          v-if="useMockAuth"
          label="Enter Dashboard (Mock)"
          icon="pi pi-chart-line"
          size="large"
          @click="emit('enter')"
        />
        <Button
          v-else
          label="Sign in with Microsoft"
          icon="pi pi-microsoft"
          size="large"
          @click="handleSignIn"
        />
      </div>

      <p v-if="!useMockAuth" class="auth-note">
        You will be redirected to sign in with your Microsoft account
      </p>
    </div>

    <div class="welcome-footer">
      <p>&copy; 2025 OnQ Global. All Rights Reserved.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Divider from 'primevue/divider'
import { loginWithMicrosoft } from '../services/authService'

const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH === 'true'

const emit = defineEmits<{
  enter: []
}>()

const handleSignIn = () => {
  if (useMockAuth) {
    emit('enter')
  } else {
    // Redirect to QSoftware backend for Microsoft authentication
    loginWithMicrosoft()
  }
}
</script>

<style scoped>
.welcome-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.welcome-content {
  background: white;
  border-radius: 16px;
  padding: 3rem;
  max-width: 600px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.welcome-logo {
  width: 180px;
  height: auto;
  margin-bottom: 1rem;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.welcome-subtitle {
  font-size: 1.25rem;
  font-weight: 500;
  color: #34495e;
  margin: 0;
}

.welcome-version {
  font-size: 0.875rem;
  color: #7f8c8d;
  font-weight: 500;
}

.welcome-description {
  font-size: 1rem;
  line-height: 1.6;
  color: #555;
  text-align: left;
  margin: 1rem 0;
}

.welcome-footer {
  position: absolute;
  bottom: 2rem;
  color: white;
  font-size: 0.875rem;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.auth-note {
  font-size: 0.875rem;
  color: #666;
  margin: 0.5rem 0 0 0;
  font-style: italic;
}
</style>
