import MockComponent from '@/test/support/MockComponent.vue'
import AdminLobby from '@supahoot-web/views/AdminLobby.vue'
import AdminView from '@supahoot-web/views/AdminView.vue'
import PlayerProviders from '@supahoot-web/views/PlayerProviders.vue'
import PlayersLobby from '@supahoot-web/views/PlayersLobby.vue'
import { createRouter, createWebHashHistory } from 'vue-router'

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
    {
      path: '',
      component: PlayerProviders,
      children: [
        { path: '/quiz/:quizId/lobby/:lobbyId', name: 'player-lobby', component: PlayersLobby },
        {
          path: '/quiz/:quizId/lobby/:lobbyId/before-start',
          name: 'player-lobby-before-quiz-starts',
          component: MockComponent,
        },
      ],
    },
  ],
})

export default router
