import { FileUtils } from '@/lib/supahoot/utils/file.utils'
import {
  container,
  notificationProvider,
  playerProvider,
} from '@/test/support/setup-container-mock'
import { testId } from '@/test/support/utils/html-utils'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { getRouter } from 'vue-router-mock'
import PlayersLobby from './PlayersLobby.vue'

describe('PlayersLobbyView', () => {


  describe('when user fills username input', () => {
    test("displays the generated avatar", async () => {
      const { avatarDataURL } = createAvatarFileAndMockDataURL()
      const playersLobbyView = mountPlayersLobbyView()

      await userFillsUsername(playersLobbyView, 'any username')

      expectDisplayAvatar(playersLobbyView, avatarDataURL)
    })
  })

  describe('when user submits the form', () => {
    test('calls the create player service', async () => {
      const avatarFile = new File([''], 'avatar.jpeg', { type: 'image/jpeg' })

      const base64ImageData = 'data:image/jpeg;base64,'
      vi.spyOn(FileUtils, 'fileToDataURL').mockResolvedValue(base64ImageData)

      container.avatarService.generateAvatarByString.mockResolvedValue(avatarFile)

      container.quizService.createPlayerByLobbyId.mockResolvedValue({
        id: 1,
        username: 'Player 1',
        avatar: '/dummy_avatar.png',
      })

      const router = getRouter()
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

  /**
   * Helper function to simulate user filling the username input
   * @param wrapper - The PlayersLobby wrapper
   * @param username - The username to fill in the input
   */
  const userFillsUsername = async (wrapper: VueWrapper, username: string): Promise<void> => {
    await wrapper.get(testId('player-username-input')).setValue(username)
    await flushPromises()
  }

  /**
   * Assert that the avatar image is displayed with the correct src
   * @param wrapper - The PlayersLobby wrapper
   * @param avatarSrc - The expected src of the avatar image
   */
  const expectDisplayAvatar = (wrapper: VueWrapper, avatarSrc: string): void => {
    const avatarImg = wrapper.get(testId('player-avatar'))
    expect(avatarImg.attributes('src')).toBe(avatarSrc)
  }

  /**
   * Returns a fake avatar file and mocks the FileUtils.fileToDataURL to return a corresponding
   * data URL
   */
  const createAvatarFileAndMockDataURL = (): { avatarFile: File; avatarDataURL: string } => {
    const avatarFile = new File([''], 'avatar.jpeg', { type: 'image/jpeg' })

    const mockedDataURL = 'data:image/jpeg;base64,'
    vi.spyOn(FileUtils, 'fileToDataURL').mockResolvedValue(mockedDataURL)

    return { avatarFile, avatarDataURL: mockedDataURL }
  }
})
