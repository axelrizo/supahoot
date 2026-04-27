import { FileUtils } from '@/lib/supahoot/utils/file.utils'
import { buildLobby, buildQuiz, createPlayer } from '@/test/support/utils/factory-utils'
import { container, playerProvider, } from '@/test/support/setup-container-mock'
import { testId } from '@/test/support/utils/html-utils'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { getRouter } from 'vue-router-mock'
import PlayersLobbyView from './PlayersLobbyView.vue'
import type { Player } from '@/lib/supahoot/quizzes/player'
import { showsErrorNotification } from '@/test/support/utils/expect-utils'
import type { Lobby } from '@/lib/supahoot/quizzes/lobby'
import type { Quiz } from '@/lib/supahoot/quizzes/quiz'

describe('PlayersLobbyView', () => {
  describe('when the player fills username and an avatar is provided', () => {
    test("displays avatar", async () => {
      const avatar = provideAvatarForPlayer()
      const playersLobbyView = mountPlayersLobbyView()

      await fillUsernameInput(playersLobbyView)

      await avatarIsDisplayed(playersLobbyView, avatar)
    })
  })

  describe('when the user is in a lobby and submits the new player form', () => {
    test('creates the player', async () => {
      const { lobby } = await playerIsInLobbyWithQuizView()
      const avatar = provideAvatarForPlayer()
      providePlayerFromCreationService()
      const playersLobbyView = mountPlayersLobbyView()

      await fillSubmitPlayerCreationForm(playersLobbyView, { username: 'any-username' })

      createsPlayer(lobby, 'any-username', avatar)
    })

    test('stores the player in memory', async () => {
      await playerIsInLobbyWithQuizView()
      provideAvatarForPlayer()
      const player = providePlayerFromCreationService()
      const playersLobbyView = mountPlayersLobbyView()

      await fillSubmitPlayerCreationForm(playersLobbyView)

      expect(playerProvider.player).toEqual(player)
    })

    test('redirects player to quiz lobby', async () => {
      const { lobby, quiz } = await playerIsInLobbyWithQuizView()
      provideAvatarForPlayer()
      providePlayerFromCreationService()
      const playersLobbyView = mountPlayersLobbyView()

      await fillSubmitPlayerCreationForm(playersLobbyView)

      redirectsPlayerToQuizLobby(playersLobbyView, lobby, quiz)
    })
  })

  describe('when player submits a very short username', () => {
    test('shows an error notification', async () => {
      const playersLobbyView = mountPlayersLobbyView()

      await fillSubmitPlayerCreationForm(playersLobbyView, { username: 'abc' })

      showsErrorNotification('Username should be at least 4 characters long')
    })
  })

  describe('when player submits and player creation fails', () => {
    test('shows an error notification', async () => {
      createPlayerFails('Error: Failed to create player')
      const playersLobbyView = mountPlayersLobbyView()

      await fillSubmitPlayerCreationForm(playersLobbyView)

      showsErrorNotification('Failed to create player')
    })
  })

  /**
   * Provides a fake avatar file for player and mocks the provider
   */
  const provideAvatarForPlayer = (): File => {
    const avatar = new File([''], 'avatar.jpeg', { type: 'image/jpeg' })
    container.avatarService.generateAvatarByString.mockResolvedValue(avatar)
    return avatar
  }

  /**
   * Asserts that the avatar image is displayed
   */
  const avatarIsDisplayed = async (wrapper: VueWrapper, avatar: File): Promise<void> => {
    const imageDataUrl = await FileUtils.fileToDataURL(avatar)
    const avatarImg = wrapper.get(testId('player-avatar'))
    await flushPromises()
    expect(avatarImg.attributes('src')).toBe(imageDataUrl)
  }

  /**
   * Mounts the PlayersLobby component and returns the wrapper
   */
  const mountPlayersLobbyView = (): VueWrapper => mount(PlayersLobbyView)

  /**
   * Assert that the player is redirected to the player lobby before quiz starts page
   * @param lobby - The lobby the player is joining
   * @param quiz - The quiz running in the lobby
   */
  const redirectsPlayerToQuizLobby = (wrapper: VueWrapper, lobby: Lobby, quiz: Quiz): void => {
    expect(wrapper.router.push).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'player-lobby-before-quiz-starts',
        params: { quizId: quiz.id.toString(), lobbyId: lobby.id.toString() }
      })
    )
  }

  /**
   * Mocks the createPlayerByLobbyId service to throw an error with the given message
   * @param error - The error message to throw
   */
  const createPlayerFails = (error: string): void => {
    container.quizService.createPlayerByLobbyId.mockRejectedValue(new Error(error))
  }

  /**
   * Simulates the player being in the player lobby view by pushing the corresponding route with a
   * lobby and quiz, and returns the created lobby and quiz
   */
  const playerIsInLobbyWithQuizView = async (): Promise<{ lobby: Lobby, quiz: Quiz }> => {
    const lobby = buildLobby()
    const quiz = buildQuiz()
    await getRouter().push({ params: { lobbyId: lobby.id, quizId: quiz.id } })
    return { lobby, quiz }
  }

  type PlayerCreationForm = Partial<{ username: string }>

  /**
   * Simulates the player filling the username input in the form
   * @param wrapper - The PlayersLobby wrapper
   * @param username - The username to fill in the input, defaults to 'any-username'
   */
  const fillUsernameInput = async (wrapper: VueWrapper, username = 'any-username'): Promise<void> => {
    await wrapper.get(testId('player-username-input')).setValue(username)
  }

  /**
   * Simulates the player filling the username input and submitting the form
   * @param wrapper - The PlayersLobby wrapper
   * @param attrs - Optional attributes to fill in the form, such as username
   */
  const fillSubmitPlayerCreationForm = async (wrapper: VueWrapper, attrs?: PlayerCreationForm): Promise<void> => {
    await fillUsernameInput(wrapper, attrs?.username)

    await wrapper.get(testId('player-form')).trigger('submit')
  }

  /**
   * Mocks the creation of a player by the server
   * @returns The fake created player returned by the mocked service
   */
  const providePlayerFromCreationService = (): Player => {
    const player = createPlayer()
    container.quizService.createPlayerByLobbyId.mockResolvedValue(player)
    return player
  }

  /**
   * Asserts that the player was created with correct attributes
   * @param lobby - The lobby the  player is joining
   * @param username - The username the player filled in the form
   * @param avatar - The avatar file that was generated for the player
   */
  const createsPlayer = (lobby: Lobby, username: string, avatar: File) => {
    expect(container.quizService.createPlayerByLobbyId).toHaveBeenCalledWith(lobby.id, username, avatar)
  }
})
