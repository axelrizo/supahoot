import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@supahoot-web/views/HomeView.vue'
import AdminView from '@supahoot-web/views/AdminView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView, },
    { path: '/admin', name: 'admin', component: AdminView }
  ],
})

export default router
