import { container, playerProvider, } from '@/test/support/setup-container-mock'
import { testId } from '@/test/support/utils/html-utils'
import { mount, VueWrapper } from '@vue/test-utils'
import { getRouter } from 'vue-router-mock'
import PlayerLobbyBeforeQuizStartsView from './PlayerLobbyBeforeQuizStartsView.vue'
import { createPlayer } from '@/test/support/utils/factory-utils'
import { showsErrorNotification } from '@/test/support/utils/expect-utils'


const mountPlayerLobbyBeforeQuizStartsView = (): VueWrapper => mount(PlayerLobbyBeforeQuizStartsView)

const playerIsInLobbyWithQuiz = async (quizId: number, lobbyId: number) => {
  await getRouter().push({ params: { quizId, lobbyId } })
}

describe('PlayerLobbyBeforeQuizStartsView', () => {
  describe('when player is in lobby', () => {
    test('shows player avatar', () => {
      const player = createPlayer()
      playerProvider.player = player
      const playerLobbyView = mountPlayerLobbyBeforeQuizStartsView()

      expect(playerLobbyView.get(testId('player-avatar')).attributes('src')).toBe(player.image)
    })

    test('shows player username', () => {
      const player = createPlayer()
      playerProvider.player = player
      const playerLobbyView = mountPlayerLobbyBeforeQuizStartsView()

      expect(playerLobbyView.get(testId('player-username')).text()).toBe(player.username)
    })
  })

  describe('when quiz starts', () => {
    test("redirects to player's quiz", async () => {
      playerIsInLobbyWithQuiz(1, 10)
      container.quizService.listenQuizStart.mockImplementation(
        (_lobbyId: number, callback: () => void) => {
          callback()
        },
      )
      const playerLobbyView = mountPlayerLobbyBeforeQuizStartsView()
      expect(playerLobbyView.router.push).toHaveBeenLastCalledWith(
        expect.objectContaining({ name: 'player-quiz', params: { quizId: 1, lobbyId: 10 }, })
      )
    })
  })

  describe('when player info is not provided', () => {
    test('shows error message', () => {
      playerProvider.player = null
      mountPlayerLobbyBeforeQuizStartsView()

      showsErrorNotification('Player not found')
    })

    test('redirects to home', () => {
      playerProvider.player = null
      const playerLobbyView = mountPlayerLobbyBeforeQuizStartsView()

      expect(playerLobbyView.router.push).toHaveBeenCalledWith(expect.objectContaining({ name: 'home' }))
    })
  })
})

