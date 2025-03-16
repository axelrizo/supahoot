import AdminLobby from '@supahoot-web/views/AdminLobby.vue'
import AdminView from '@supahoot-web/views/AdminView.vue'
import PlayersLobby from '@supahoot-web/views/PlayersLobby.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/admin', name: 'admin', component: AdminView },
    { path: '/admin/lobby/:lobbyId', name: 'admin-lobby', component: AdminLobby },
    { path: '/lobby/:lobbyId', name: 'player-lobby', component: PlayersLobby },
  ],
})

export default router
