import { FileUtils } from '@/lib/supahoot/utils/file.utils'
import { buildLobby, buildQuiz, buildPlayer } from '@/test/support/utils/factory-utils'
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
      const avatar = avatarIsProvided()
      const { view } = await playerVistisLobbyWithActiveQuiz()

      await playerFillsUsername(view)

      await displaysAvatar(view, avatar)
    })
  })

  describe('when player is in lobby with active quiz and submits player form', () => {
    test('creates the player', async () => {
      const avatar = avatarIsProvided()
      newPlayerIsCreatedAndProvided()
      const { lobby, view } = await playerVistisLobbyWithActiveQuiz()

      await playerFillsAndSubmitsPlayerForm(view, { username: 'any-username' })

      createsPlayer(lobby, 'any-username', avatar)
    })

    test('stores the player in memory', async () => {
      avatarIsProvided()
      const player = newPlayerIsCreatedAndProvided()
      const { view } = await playerVistisLobbyWithActiveQuiz()

      await playerFillsAndSubmitsPlayerForm(view)

      expect(playerProvider.player).toEqual(player)
    })

    test('redirects player to quiz lobby', async () => {
      avatarIsProvided()
      newPlayerIsCreatedAndProvided()
      const { view, lobby, quiz } = await playerVistisLobbyWithActiveQuiz()

      await playerFillsAndSubmitsPlayerForm(view)

      redirectsPlayerToQuizLobby(view, lobby, quiz)
    })
  })

  describe('when player submits a very short username', () => {
    test('shows an error notification', async () => {
      const { view } = await playerVistisLobbyWithActiveQuiz()

      await playerFillsAndSubmitsPlayerForm(view, { username: 'abc' })

      showsErrorNotification('Username should be at least 4 characters long')
    })
  })

  describe('when player submits and player creation fails', () => {
    test('shows an error notification', async () => {
      createPlayerFails('Error: Failed to create player')
      const { view } = await playerVistisLobbyWithActiveQuiz()

      await playerFillsAndSubmitsPlayerForm(view)

      showsErrorNotification('Failed to create player')
    })
  })

  /**
   * Mocks the quiz service to return a new player when creating a player by lobby id
   * @returns The player that was "created"
   */
  const newPlayerIsCreatedAndProvided = (): Player => {
    const player = buildPlayer()
    container.quizService.createPlayerByLobbyId.mockResolvedValue(player)
    return player
  }

  /**
   * Simulates the player visiting the lobby with an active quiz
   */
  const playerVistisLobbyWithActiveQuiz = async (): Promise<{ lobby: Lobby, quiz: Quiz, view: VueWrapper }> => {
    const lobby = buildLobby()
    const quiz = buildQuiz()

    await getRouter().push({ params: { lobbyId: lobby.id, quizId: quiz.id } })

    const wrapper = mount(PlayersLobbyView)

    return { lobby, quiz, view: wrapper }
  }

  /**
   * Simulates the player filling the username input and submitting the form
   * @param wrapper - The PlayersLobby wrapper
   * @param player - The player attributes to fill in the form
   */
  const playerFillsAndSubmitsPlayerForm = async (wrapper: VueWrapper, player?: Partial<Player>) => {
    await playerFillsUsername(wrapper, player?.username)

    await wrapper.get(testId('player-form')).trigger('submit')
  }

  /**
   * Simulates the player filling the username input in the form
   * @param wrapper - The PlayersLobby wrapper
   * @param username - The username to fill in the input, defaults to 'any-username'
   */
  const playerFillsUsername = async (wrapper: VueWrapper, username = 'any-username'): Promise<void> => {
    await wrapper.get(testId('player-username-input')).setValue(username)
  }

  /**
   * Provides a fake avatar file for player and mocks the provider
   */
  const avatarIsProvided = (): File => {
    const avatar = new File([''], 'avatar.jpeg', { type: 'image/jpeg' })
    container.avatarService.generateAvatarByString.mockResolvedValue(avatar)
    return avatar
  }

  /**
   * Asserts that the avatar image is displayed
   */
  const displaysAvatar = async (wrapper: VueWrapper, avatar: File): Promise<void> => {
    const imageDataUrl = await FileUtils.fileToDataURL(avatar)
    const avatarImg = wrapper.get(testId('player-avatar'))
    await flushPromises()
    expect(avatarImg.attributes('src')).toBe(imageDataUrl)
  }

  /**
   * Mounts the PlayersLobby component and returns the wrapper
   */
  const playerVisitsLobbyView = (): VueWrapper => mount(PlayersLobbyView)

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
   * Asserts that the player was created with correct attributes
   * @param lobby - The lobby the  player is joining
   * @param username - The username the player filled in the form
   * @param avatar - The avatar file that was generated for the player
   */
  const createsPlayer = (lobby: Lobby, username: string, avatar: File) => {
    expect(container.quizService.createPlayerByLobbyId).toHaveBeenCalledWith(lobby.id, username, avatar)
  }
})
