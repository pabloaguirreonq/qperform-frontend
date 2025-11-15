<template>
  <div class="access-denied-container">
    <Card class="access-denied-card">
      <template #header>
        <div class="access-denied-icon">
          <i class="pi pi-lock" style="font-size: 4rem; color: var(--q-danger)"></i>
        </div>
      </template>
      <template #title>
        <h2>Access Denied</h2>
      </template>
      <template #content>
        <Message severity="error" :closable="false">
          You do not have authorization to access this application.
        </Message>

        <div v-if="user" class="user-info">
          <p><strong>User:</strong> {{ user.displayName }}</p>
          <p><strong>Email:</strong> {{ user.email }}</p>
          <p v-if="user.jobTitle"><strong>Job Title:</strong> {{ user.jobTitle }}</p>
        </div>

        <Divider />

        <p class="access-info">
          Access to QPerform is limited to:
        </p>
        <ul class="role-list">
          <li>Team Leads and above</li>
          <li>Supervisors</li>
          <li>Assistant Managers</li>
          <li>Managers</li>
          <li>Directors</li>
          <li>AVPs and Executive Leadership</li>
        </ul>

        <p class="contact-info">
          If you believe you should have access, please contact:
          <br />
          <strong>ONQ.PowerBI.MIS@onqoc.com</strong>
        </p>
      </template>
      <template #footer>
        <Button
          label="Back to Welcome"
          icon="pi pi-arrow-left"
          @click="emit('goBack')"
        />
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import type { UserProfile } from '../types'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Divider from 'primevue/divider'

defineProps<{
  user: UserProfile | null
}>()

const emit = defineEmits<{
  goBack: []
}>()
</script>

<style scoped>
.access-denied-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--q-bg-secondary);
  padding: 2rem;
}

.access-denied-card {
  max-width: 600px;
  width: 100%;
}

.access-denied-icon {
  text-align: center;
  padding: 2rem;
}

.user-info {
  background: var(--q-bg-secondary);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.user-info p {
  margin: 0.5rem 0;
}

.access-info {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.role-list {
  margin: 1rem 0;
  padding-left: 2rem;
}

.contact-info {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--q-secondary-lighter);
  border-radius: 8px;
  text-align: center;
}
</style>
