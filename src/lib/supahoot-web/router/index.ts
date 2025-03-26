import MockComponent from '@/test/support/MockComponent.vue'
import AdminLobby from '@supahoot-web/views/AdminLobby.vue'
import AdminView from '@supahoot-web/views/AdminView.vue'
import HomeView from '@supahoot-web/views/HomeView.vue'
import PlayerLobbyBeforeQuizStarts from '@supahoot-web/views/PlayerLobbyBeforeQuizStarts.vue'
import PlayerProviders from '@supahoot-web/views/PlayerProviders.vue'
import PlayerQuizView from '@supahoot-web/views/PlayerQuizView.vue'
import PlayersLobby from '@supahoot-web/views/PlayersLobby.vue'
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/admin', name: 'admin', component: AdminView },
    { path: '/admin/quiz/:quizId/lobby/:lobbyId', name: 'admin-lobby', component: AdminLobby },
    {
      path: '/admin/quiz/:quizId/lobby/:lobbyId/awards',
      name: 'admin-awards',
      component: MockComponent,
    },
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/quiz/:quizId/lobby/:lobbyId',
      component: PlayerProviders,
      children: [
        { path: '', name: 'player-lobby', component: PlayersLobby },
        {
          path: 'before-start',
          name: 'player-lobby-before-quiz-starts',
          component: PlayerLobbyBeforeQuizStarts,
        },
        {
          path: 'quiz-started',
          name: 'player-quiz',
          component: PlayerQuizView,
        },
      ],
    },
  ],
})

export default router
