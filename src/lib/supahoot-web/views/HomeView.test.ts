import { container } from '@/test/support/setup-container-mock'
import { testId } from '@/test/support/utils/html-utils'
import HomeView from '@supahoot-web/views/HomeView.vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { showsErrorNotification } from '@/test/support/utils/expect-utils'
import type { Quiz } from '@/lib/supahoot/quizzes/quiz'
import type { Lobby } from '@/lib/supahoot/quizzes/lobby'
import { buildLobby, buildQuiz } from '@/test/support/utils/factory-utils'

describe('HomeView', () => {
  describe('when lobby has an active quiz and player joins', () => {
    test('redirects to lobby', async () => {
      const { lobby, quiz } = lobbyWithActiveQuiz()
      const view = playerVisitsHome()

      await playerJoinsLobby(view, lobby)

      expectsRedirectToLobby(view, lobby, quiz)
    })
  })

  describe('when service throws an error and user joins', () => {
    test('shows error notification', async () => {
      quizServiceThrowsError('Any error')
      const view = playerVisitsHome()

      await playerJoinsLobby(view, buildLobby())

      showsErrorNotification('Any error')
    })
  })

  describe('when the user entes an invalid lobby id', () => {
    test('shows error notification', async () => {
      const view = playerVisitsHome()

      await playerJoinsLobby(view, 'string-instead-of-number')

      showsErrorNotification('Invalid lobby id')
    })
  })

  /**
   * Mounts HomeView
   * @returns The mounted HomeView component
   */
  const playerVisitsHome = (): VueWrapper => mount(HomeView)

  /**
   * Each lobby has a quiz associated with it, so we mock the returned quiz simulating
   * that the lobby has that quiz running.
   * @param quizId The quiz id returned by the service
   */
  const lobbyWithActiveQuiz = (): { quiz: Quiz, lobby: Lobby } => {
    const quiz = buildQuiz()
    const lobby = buildLobby()
    container.quizService.getQuizByLobbyId.mockResolvedValue(quiz)

    return { quiz, lobby }
  }

  /**
    * Mocks the quiz service to throw an error when trying to get a quiz by lobby id
    * @param error The error message to throw
    */
  const quizServiceThrowsError = (error: string): void => {
    container.quizService.getQuizByLobbyId.mockRejectedValue(new Error(error))
    return
  }

  /**
   * Simulates the user joining a lobby by filling the form and submitting it
   * @param wrapper The mounted HomeView component
   * @param lobby The lobby the user is trying to join
   */
  const playerJoinsLobby = async (wrapper: VueWrapper, lobby: Lobby | string): Promise<void> => {
    const lobbyId = typeof lobby === 'string' ? lobby : lobby.id.toString()

    await wrapper.get(testId('join-lobby-input')).setValue(lobbyId)
    await wrapper.get(testId('join-lobby-form')).trigger('submit')
    return
  }

  /**
   * Expects the user to be redirected to player lobby with the quiz associated with the lobby
   * @param wrapper The mounted HomeView component
   * @param lobbyId The lobby id the user is trying to join
   * @param quizId The quiz id associated with the lobby
   */
  const expectsRedirectToLobby = (wrapper: VueWrapper, lobby: Lobby, quiz: Quiz): void => {
    expect(wrapper.router.push).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'player-lobby', params: { lobbyId: lobby.id.toString(), quizId: quiz.id.toString() } })
    )
  }
})
