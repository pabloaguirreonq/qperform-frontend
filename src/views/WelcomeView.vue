<template>
  <div class="welcome-container">
    <div class="welcome-card">
      <!-- Logo Section -->
      <div class="logo-section">
        <img
          src="https://onq.global/wp-content/uploads/2025/05/OnQ_Logo_4Color-400x90.webp"
          alt="OnQ Global Logo"
          class="welcome-logo"
        />
      </div>

      <!-- Title Section -->
      <div class="title-section">
        <h1 class="app-title">QPerform</h1>
        <p class="app-subtitle">Performance Management Suite</p>
        <div class="version-badge">v0.1.0</div>
      </div>

      <!-- Description -->
      <div class="description-section">
        <p class="description-text">
          A comprehensive performance management platform providing leadership with clear, visual insights into
          Production and QA performance metrics across all operational teams.
        </p>
      </div>

      <!-- Sign In Section -->
      <div class="signin-section">
        <h2 class="signin-title">Sign in to continue</h2>
        <p class="signin-subtitle">{{ authMode === 'mock' ? 'Development Mode' : 'Use your OnQ Microsoft account' }}</p>

        <!-- Mock Login Button (Development Only) -->
        <button v-if="authMode === 'mock'" class="mock-button" @click="handleMockLogin" :disabled="isSigningIn">
          <div class="mock-button-content">
            <i class="pi pi-user"></i>
            <span class="mock-button-text">{{ isSigningIn ? 'Signing in...' : `Sign in as ${mockUserRole}` }}</span>
          </div>
        </button>

        <!-- Microsoft Sign In Button -->
        <button v-else class="microsoft-button" @click="handleSignIn" :disabled="isSigningIn">
          <div class="microsoft-button-content">
            <svg class="microsoft-logo" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
              <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
              <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
            </svg>
            <span class="microsoft-button-text">{{ isSigningIn ? 'Signing in...' : 'Sign in with Microsoft' }}</span>
          </div>
        </button>

        <p class="auth-info" v-if="authMode === 'mock'">
          <i class="pi pi-info-circle"></i>
          Mock authentication - no API calls required
        </p>
        <p class="auth-info" v-else>
          <i class="pi pi-info-circle"></i>
          A secure Microsoft login window will open
        </p>
      </div>

      <!-- Features -->
      <div class="features-section">
        <div class="feature-item">
          <i class="pi pi-shield feature-icon"></i>
          <span>Secure Authentication</span>
        </div>
        <div class="feature-item">
          <i class="pi pi-chart-bar feature-icon"></i>
          <span>Real-time Analytics</span>
        </div>
        <div class="feature-item">
          <i class="pi pi-users feature-icon"></i>
          <span>Team Performance</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="welcome-footer">
      <p>&copy; 2025 OnQ Global. All Rights Reserved.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginWithMicrosoft } from '../services/authService'

const router = useRouter()
const isSigningIn = ref(false)

// Get auth mode and mock user role from environment
const authMode = import.meta.env.VITE_AUTH_MODE || 'qsoftware'
const mockUserRole = import.meta.env.VITE_MOCK_USER_ROLE || 'director'

const emit = defineEmits<{
  enter: []
}>()

const handleSignIn = () => {
  if (isSigningIn.value) return

  isSigningIn.value = true

  try {
    // This will redirect to QSoftware OAuth flow -> Microsoft login -> callback
    // The loginWithMicrosoft function now handles redirect-based OAuth
    loginWithMicrosoft()

    // Note: We don't set isSigningIn to false here because the page will redirect
    // The user will return via /auth/callback route
  } catch (error) {
    console.error('Sign in error:', error)
    isSigningIn.value = false
  }
}

const handleMockLogin = async () => {
  if (isSigningIn.value) return

  isSigningIn.value = true

  try {
    console.log(`Mock login: Signing in as ${mockUserRole}`)

    // Simulate a brief loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500))

    // Navigate directly to home - App.vue will handle authentication
    await router.push('/')
  } catch (error) {
    console.error('Mock login error:', error)
    isSigningIn.value = false
  }
}
</script>

<style scoped>
/* Container */
.welcome-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--q-secondary) 0%, var(--q-secondary-dark) 100%);
  padding: 2rem;
  position: relative;
}

/* Card */
.welcome-card {
  background: var(--q-bg-primary);
  border-radius: 12px;
  padding: 3rem 2.5rem;
  max-width: 480px;
  width: 100%;
  box-shadow: var(--q-shadow-xl);
  text-align: center;
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Logo Section */
.logo-section {
  margin-bottom: 2rem;
}

.welcome-logo {
  width: 200px;
  height: auto;
}

/* Title Section */
.title-section {
  margin-bottom: 1.5rem;
}

.app-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--q-text-primary);
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.app-subtitle {
  font-size: 1rem;
  color: var(--q-text-secondary);
  margin: 0;
  font-weight: 400;
}

.version-badge {
  display: inline-block;
  background: var(--q-primary-lighter);
  color: var(--q-primary-dark);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 0.75rem;
}

/* Description Section */
.description-section {
  margin-bottom: 2rem;
  padding: 0 0.5rem;
}

.description-text {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--q-text-secondary);
  margin: 0;
  text-align: center;
}

/* Sign In Section */
.signin-section {
  margin-bottom: 2rem;
}

.signin-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--q-text-primary);
  margin: 0 0 0.5rem 0;
}

.signin-subtitle {
  font-size: 0.875rem;
  color: var(--q-text-secondary);
  margin: 0 0 1.5rem 0;
}

/* Microsoft Button */
.microsoft-button {
  width: 100%;
  background: var(--q-primary);
  border: 2px solid var(--q-primary);
  border-radius: 6px;
  padding: 0.875rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  box-shadow: var(--q-shadow-sm);
}

.microsoft-button:hover:not(:disabled) {
  background: var(--q-primary-dark);
  border-color: var(--q-primary-dark);
  box-shadow: var(--q-shadow-md);
  transform: translateY(-1px);
}

.microsoft-button:active:not(:disabled) {
  background: var(--q-primary-dark);
  transform: translateY(0);
}

.microsoft-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.microsoft-button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.microsoft-logo {
  width: 21px;
  height: 21px;
  flex-shrink: 0;
}

.microsoft-button-text {
  font-size: 0.9375rem;
  font-weight: 600;
  color: white;
}

/* Mock Login Button (Development) */
.mock-button {
  width: 100%;
  background: #f59e0b;
  border: 2px solid #f59e0b;
  border-radius: 6px;
  padding: 0.875rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  box-shadow: var(--q-shadow-sm);
}

.mock-button:hover:not(:disabled) {
  background: #d97706;
  border-color: #d97706;
  box-shadow: var(--q-shadow-md);
  transform: translateY(-1px);
}

.mock-button:active:not(:disabled) {
  background: #d97706;
  transform: translateY(0);
}

.mock-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mock-button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.mock-button-content i {
  font-size: 1.25rem;
  color: white;
}

.mock-button-text {
  font-size: 0.9375rem;
  font-weight: 600;
  color: white;
  text-transform: capitalize;
}

.auth-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--q-text-light);
  margin: 1rem 0 0 0;
}

.auth-info .pi {
  font-size: 0.875rem;
}

/* Features Section */
.features-section {
  display: flex;
  justify-content: space-around;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 1px solid var(--q-border);
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.feature-icon {
  font-size: 1.5rem;
  color: var(--q-primary);
}

.feature-item span {
  font-size: 0.75rem;
  color: var(--q-text-secondary);
  text-align: center;
  font-weight: 500;
}

/* Footer */
.welcome-footer {
  position: absolute;
  bottom: 2rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.8125rem;
  text-align: center;
}

.welcome-footer p {
  margin: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .welcome-card {
    padding: 2rem 1.5rem;
  }

  .app-title {
    font-size: 1.75rem;
  }

  .features-section {
    flex-direction: column;
    gap: 1.5rem;
  }
}
</style>
