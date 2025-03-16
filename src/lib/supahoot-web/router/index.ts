import AdminView from '@supahoot-web/views/AdminView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import AdminLobby from '@supahoot-web/views/AdminLobby.vue'
import MockComponent from '@/test/support/MockComponent.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/admin', name: 'admin', component: AdminView },
    { path: '/admin/lobby/:lobbyId', name: 'admin-lobby', component: AdminLobby },
    { path: '/lobby/:lobbyId', name: 'user-lobby', component: MockComponent },
  ],
})

export default router
