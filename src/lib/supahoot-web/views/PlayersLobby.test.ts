import { FileUtils } from '@/lib/supahoot/utils/file.utils'
import {
  container,
  playerProvider,
} from '@/test/support/setup-container-mock'
import { testId } from '@/test/support/utils/html-utils'
import { mount, type VueWrapper } from '@vue/test-utils'
import { getRouter } from 'vue-router-mock'
import PlayersLobby from './PlayersLobby.vue'
import type { Player } from '@/lib/supahoot/quizzes/player'
import { expectErrorNotification } from '@/test/support/utils/expect-utils'

describe('PlayersLobbyView', () => {
  describe('when player fills username input', () => {
    test("displays the generated avatar", async () => {
      const { avatarDataURL } = createAvatarFileAndMockDataURL()
      const playersLobbyView = mountPlayersLobbyView()

      await playerFillsUsername(playersLobbyView, 'any username')

      expectDisplayAvatar(playersLobbyView, avatarDataURL)
    })
  })


  describe('when player submits the form', () => {
    test('calls the create player service by lobby', async () => {
      await playerIsInLobbyWithQuiz(10, 1)
      const { avatarFile } = createAvatarFileAndMockDataURL()
      createPlayerServiceReturnsAPlayer()
      const playersLobbyView = mountPlayersLobbyView()

      await playerFillsUsernameAndSubmitsForm(playersLobbyView, 'any-username')

      expectCallsCreatePlayerServiceWithLobbyIdUsernameAvatarFile(10, 'any-username', avatarFile)
    })

    test('stores the returned player data in player provider', async () => {
      await playerIsInLobbyWithQuiz(10, 1)
      createAvatarFileAndMockDataURL()
      const player = createPlayerServiceReturnsAPlayer()
      const playersLobbyView = mountPlayersLobbyView()

      await playerFillsUsernameAndSubmitsForm(playersLobbyView, 'any-username')

      expect(playerProvider.player).toEqual(player)
    })

    test('redirects to before quiz starts view', async () => {
      await playerIsInLobbyWithQuiz(10, 1)
      createAvatarFileAndMockDataURL()
      createPlayerServiceReturnsAPlayer()
      const playersLobbyView = mountPlayersLobbyView()

      await playerFillsUsernameAndSubmitsForm(playersLobbyView, 'any-username')

      expectRedirectsToPlayerLobbyBeforeQuizStartsView(playersLobbyView, 10, 1)
    })
  })

  describe('when player submits a very short username', () => {
    test('shows an error notification', async () => {
      const playersLobbyView = mountPlayersLobbyView()

      await playerFillsUsernameAndSubmitsForm(playersLobbyView, '123')

      expectErrorNotification('Username should be at least 4 characters long')
    })
  })


  describe('when player submits and service throws an error', () => {
    test('shows an error notification', async () => {
      const playersLobbyView = mountPlayersLobbyView()
      createPlayerServiceFailsWith('Error: Failed to create player')

      await playerFillsUsernameAndSubmitsForm(playersLobbyView, 'any-username')

      expectErrorNotification('Failed to create player')
    })
  })

  /**
   * Mounts the PlayersLobby component and returns the wrapper
   */
  const mountPlayersLobbyView = (): VueWrapper => mount(PlayersLobby)

  /**
   * Helper function to simulate player filling the username input
   * @param wrapper - The PlayersLobby wrapper
   * @param username - The username to fill in the input
   */
  const playerFillsUsername = async (wrapper: VueWrapper, username: string): Promise<void> => {
    await wrapper.get(testId('player-username-input')).setValue(username)
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

    container.avatarService.generateAvatarByString.mockResolvedValue(avatarFile)

    return { avatarFile, avatarDataURL: mockedDataURL }
  }

  /**
   * player fills the username input and submits the form
   * @param wrapper - The PlayersLobby wrapper
   * @param username - The username to fill in the input
   */
  const playerFillsUsernameAndSubmitsForm = async (wrapper: VueWrapper, username: string): Promise<void> => {
    await playerFillsUsername(wrapper, username)
    await wrapper.get(testId('player-form')).trigger('submit')
  }

  /**
   * Simulates the player being in a lobby with a quiz by pushing the corresponding route
   * @param lobbyId - The ID of the lobby
   * @param quizId - The ID of the quiz
   */
  const playerIsInLobbyWithQuiz = async (lobbyId: number, quizId: number) => {
    await getRouter().push({ params: { lobbyId, quizId } })
  }

  /**
   * Asserts that the createPlayerByLobbyId service was called with the correct lobby ID,
   * username and avatar file
   * @param lobbyId - The expected lobby ID
   * @param username - The expected username
   * @param avatarFile - The expected avatar file
   */
  const expectCallsCreatePlayerServiceWithLobbyIdUsernameAvatarFile =
    (lobbyId: number, username: string, avatarFile: File,) => {
      expect(container.quizService.createPlayerByLobbyId).toHaveBeenCalledWith(lobbyId, username, avatarFile)
    }

  /**
   * Player factory
   * @param replaceAttrs - Optional attributes to override the default player values
   */
  const createPlayer = (replaceAttrs?: Partial<Player>): Player => {
    const player = { id: 100, username: 'any-player-name', image: '/any-avatar-path' }
    if (replaceAttrs) return { ...player, ...replaceAttrs }
    return player
  }

  /**
   * Mocks the createPlayerByLobbyId service to return a player and returns that player
   */
  const createPlayerServiceReturnsAPlayer = (): Player => {
    const player = createPlayer()
    container.quizService.createPlayerByLobbyId.mockResolvedValue(player)
    return player
  }

  /**
   * Assert that the player is redirected to the player lobby before quiz starts page
   * @param lobbyId - The expected lobby ID in the route params
   * @param quizId - The expected quiz ID in the route params
   */
  const expectRedirectsToPlayerLobbyBeforeQuizStartsView = (wrapper: VueWrapper, lobbyId: number, quizId: number): void => {
    expect(wrapper.router.push).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'player-lobby-before-quiz-starts',
        params: { quizId: quizId.toString(), lobbyId: lobbyId.toString() },
      }),
    )
  }

  /**
   * Mocks the createPlayerByLobbyId service to throw an error with the given message
   * @param error - The error message to throw
   */
  const createPlayerServiceFailsWith = (error: string): void => {
    container.quizService.createPlayerByLobbyId.mockRejectedValue(new Error(error))
  }
})
