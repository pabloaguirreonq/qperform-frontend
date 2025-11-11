<template>
  <div class="performance-view">
    <Header
      :user-name="currentUser.name"
      :notification-count="currentUser.notifications"
      @logo-click="handleGoToWelcome"
    />

    <main class="performance-content-wrapper">
      <div class="performance-header">
        <h2>Performance Review</h2>
        <p v-if="roleMessage" class="role-message">{{ roleMessage }}</p>
      </div>

      <div class="tab-navigation">
        <router-link
          to="/performance/underperforming"
          class="tab-link"
          active-class="active"
        >
          Underperforming Review
        </router-link>
        <router-link
          to="/performance/summary"
          class="tab-link"
          active-class="active"
        >
          Monthly Summary
        </router-link>
        <router-link
          to="/performance/action-log"
          class="tab-link"
          active-class="active"
        >
          Action Log
        </router-link>
      </div>

      <div class="performance-content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Header from '../components/header.vue'
import { useUserRole } from '../composables/useUserRole'

const router = useRouter()
const { role, user, canTakeAction, receivesNotifications } = useUserRole()

const currentUser = computed(() => ({
  name: user.value?.displayName || 'User',
  notifications: 3 // TODO: Get actual notification count
}))

const roleMessage = computed(() => {
  if (!role.value) return ''

  if (canTakeAction.value) {
    return `Your role (${role.value}) receives automated Weekly Performance Reports and has full action authority.`
  }

  if (receivesNotifications.value) {
    return `Your role (${role.value}) receives Weekly Notifications to monitor performance trends.`
  }

  return `Your role (${role.value}) has view-only access to all dashboards.`
})

const handleGoToWelcome = () => {
  router.push('/')
}
</script>

<style scoped>
.performance-view {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.performance-content-wrapper {
  padding: 24px 40px;
  width: 100%;
}

.performance-header {
  margin-bottom: 20px;
}

.performance-header h2 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
}

.role-message {
  color: #005a9e;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.tab-navigation {
  display: flex;
  gap: 8px;
  border-bottom: 2px solid #e5e5e5;
  margin-bottom: 20px;
}

.tab-link {
  padding: 12px 20px;
  text-decoration: none;
  color: #666;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
  font-weight: 500;
}

.tab-link:hover {
  color: #005a9e;
  background-color: #f5f5f5;
}

.tab-link.active {
  color: #005a9e;
  border-bottom-color: #005a9e;
}

.performance-content {
  margin-top: 20px;
}
</style>
