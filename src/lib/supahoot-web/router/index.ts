import AdminView from '@supahoot-web/views/AdminView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [{ path: '/admin', name: 'admin', component: AdminView }],
})

export default router
