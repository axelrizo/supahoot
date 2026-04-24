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

const avatarFile = new File([''], 'avatar.jpeg', { type: 'image/jpeg' })

const base64ImageData = 'data:image/jpeg;base64,'
vi.spyOn(FileUtils, 'fileToDataURL').mockResolvedValue(base64ImageData)

describe('PlayersLobbyView', () => {
  describe('when user fills username input', () => {
    test("gets a generated avatar", async () => {
      container.avatarService.generateAvatarByString.mockResolvedValue(avatarFile)

      const playersLobbyView = mountPlayersLobbyView()

      await playersLobbyView.get(testId('player-username-input')).setValue('input')
      await flushPromises()

      expect(playersLobbyView.get(testId('player-avatar')).attributes('src')).toBe(base64ImageData)
    })
  })

  describe('when user submits the form', () => {
    test('calls the create player service', async () => {
      const router = getRouter()
      container.quizService.createPlayerByLobbyId.mockResolvedValue({
        id: 1,
        username: 'Player 1',
        avatar: '/dummy_avatar.png',
      })

      router.setParams({ quizId: 1, lobbyId: 1 })

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
      container.quizService.createPlayerByLobbyId.mockResolvedValue({
        id: 1,
        username: 'Player 1',
        avatar: '/dummy_avatar.png',
      })
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
      const router = getRouter()
      container.quizService.createPlayerByLobbyId.mockResolvedValue({
        id: 1,
        username: 'Player 1',
        avatar: '/dummy_avatar.png',
      })
      router.setParams({ quizId: 1, lobbyId: 1 })
      const playersLobbyView = mountPlayersLobbyView()

      await playersLobbyView.get(testId('player-username-input')).setValue('Player 1')
      await playersLobbyView.get(testId('player-form')).trigger('submit')

      expect(router.push).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'player-lobby-before-quiz-starts',
          params: { quizId: '1', lobbyId: '1' },
        }),
      )
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
