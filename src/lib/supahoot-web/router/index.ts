import MockComponent from '@/test/support/MockComponent.vue'
import AdminLobby from '@supahoot-web/views/AdminLobby.vue'
import AdminView from '@supahoot-web/views/AdminView.vue'
import PlayerProviders from '@supahoot-web/views/PlayerProviders.vue'
import PlayersLobby from '@supahoot-web/views/PlayersLobby.vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/admin', name: 'admin', component: AdminView },
    { path: '/admin/quiz/:quizId/lobby/:lobbyId', name: 'admin-lobby', component: AdminLobby },
    {
      path: '/admin/quiz/:quizId/lobby/:lobbyId/question/:questionOrder',
      name: 'admin-quiz',
      component: MockComponent,
    },
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/quiz/:quizId/lobby/:lobbyId',
      component: PlayerProviders,
      children: [
        { path: '', name: 'player-lobby', component: PlayersLobby },
        {
          path: '/before-start',
          name: 'player-lobby-before-quiz-starts',
          component: MockComponent,
        },
      ],
    },
  ],
})

export default router
