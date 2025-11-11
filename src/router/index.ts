import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'welcome',
    component: () => import('../views/WelcomeView.vue')
  },
  {
    path: '/performance',
    component: () => import('../views/PerformanceView.vue'),
    children: [
      {
        path: '',
        name: 'performance',
        redirect: { name: 'underperforming' }
      },
      {
        path: 'underperforming',
        name: 'underperforming',
        component: () => import('../views/UnderperformingView.vue')
      },
      {
        path: 'summary',
        name: 'summary',
        component: () => import('../views/MonthlySummaryView.vue')
      },
      {
        path: 'action-log',
        name: 'action-log',
        component: () => import('../views/ActionLogView.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
