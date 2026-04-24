import { FileUtils } from '@/lib/supahoot/utils/file.utils'
import MockComponent from '@/test/support/MockComponent.vue'
import {
  container,
  notificationProvider,
  playerProvider,
} from '@/test/support/setup-container-mock'
import { testId } from '@/test/support/utils/html-utils'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { getRouter, type RouterMock } from 'vue-router-mock'
import PlayersLobby from './PlayersLobby.vue'

let router: RouterMock

const avatarFile = new File([''], 'avatar.jpeg', { type: 'image/jpeg' })

const base64ImageData = 'data:image/jpeg;base64,'
vi.spyOn(FileUtils, 'fileToDataURL').mockResolvedValue(base64ImageData)

describe('PlayersLobbyView', () => {
  beforeEach(() => {
    router = getRouter()

    router.setParams({ quizId: 1, lobbyId: 1 })

    router.addRoute({
      path: '/quiz/:quizId/lobby/:lobbyId',
      name: 'player-lobby-before-quiz-starts',
      component: MockComponent,
    })

    container.avatarService.generateAvatarByString.mockResolvedValue(avatarFile)

    container.quizService.createPlayerByLobbyId.mockResolvedValue({
      id: 1,
      username: 'Player 1',
      avatar: '/dummy_avatar.png',
    })
  })

  describe('when user fills username input', () => {
    test("gets a generated avatar", async () => {
      const playersLobbyView = mountPlayersLobbyView()

      await playersLobbyView.get(testId('player-username-input')).setValue('input')
      await flushPromises()

      expect(playersLobbyView.get(testId('player-avatar')).attributes('src')).toBe(base64ImageData)
    })
  })

  describe('when user submits the form', () => {
    test('calls the create player service', async () => {
      const playersLobbyView = mountPlayersLobbyView()

      await playersLobbyView.get(testId('player-username-input')).setValue('Player 1')
      await playersLobbyView.get(testId('player-form')).trigger('submit')

      expect(container.quizService.createPlayerByLobbyId).toHaveBeenCalledWith(
        1,
        'Player 1',
        avatarFile,
      )
    })

    test('stores user in player provider', async () => {
      const playersLobbyView = mountPlayersLobbyView()

      await playersLobbyView.get(testId('player-username-input')).setValue('Player 1')
      await playersLobbyView.get(testId('player-form')).trigger('submit')

      expect(playerProvider.player).toEqual({
        id: 1,
        username: 'Player 1',
        avatar: '/dummy_avatar.png'
      })
    })

    test('redirects to before quiz starts page', async () => {
      const playersLobbyView = mountPlayersLobbyView()

      await playersLobbyView.get(testId('player-username-input')).setValue('Player 1')
      await playersLobbyView.get(testId('player-form')).trigger('submit')

      expect(router.currentRoute.value).toMatchObject({
        name: 'player-lobby-before-quiz-starts',
        params: { quizId: '1', lobbyId: '1' },
      })
    })
  })

  describe('when user submits a very short username', () => {
    test('shows an error notification', async () => {
      const playersLobbyView = mountPlayersLobbyView()

      await playersLobbyView.get(testId('player-username-input')).setValue('123')
      await playersLobbyView.get(testId('player-form')).trigger('submit')

      expect(notificationProvider.showNotification).toHaveBeenCalledWith(
        'Error: Username should be at least 4 characters long',
      )
    })
  })

  describe('when user submits and service throws an error', () => {
    test('shows an error notification', async () => {
      const playersLobbyView = mountPlayersLobbyView()
      container.quizService.createPlayerByLobbyId.mockRejectedValue(
        new Error('Error: Failed to create player'),
      )

      await playersLobbyView.get(testId('player-username-input')).setValue('Player 1')
      await playersLobbyView.get(testId('player-form')).trigger('submit')

      expect(notificationProvider.showNotification).toHaveBeenCalledWith(
        'Error: Failed to create player',
      )
    })
  })

  /**
   * Mounts the PlayersLobby component and returns the wrapper
   */
  const mountPlayersLobbyView = (): VueWrapper => mount(PlayersLobby)
})
