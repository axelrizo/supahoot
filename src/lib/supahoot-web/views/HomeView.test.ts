import { container, notificationProvider } from '@/test/support/setup-container-mock'
import { testId } from '@/test/support/utils/html-utils'
import HomeView from '@supahoot-web/views/HomeView.vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { sendsErrorNotification } from '@/test/support/utils/expect-utils'
import type { Quiz } from '@/lib/supahoot/quizzes/quiz'
import type { Lobby } from '@/lib/supahoot/quizzes/lobby'
import { buildLobby, buildQuiz } from '@/test/support/utils/factory-utils'

describe('HomeView', () => {
  describe('when lobby exists running a quiz and user joins', () => {
    test('redirects to lobby', async () => {
      const quiz = buildQuiz()
      const lobby = buildLobby()

      lobbyRunningQuiz(quiz)
      const homeView = mountHomeView()

      await userJoinsLobby(homeView, lobby)

      redirectsToLobbyWithRunningQuiz(homeView, lobby, quiz)
    })
  })

  describe('when service throws an error and user joins', () => {
    test('sends error notification', async () => {
      const errorMessage = 'Any error'

      quizServiceThrowsError(errorMessage)
      const homeView = mountHomeView()

      await userJoinsLobby(homeView, buildLobby())

      sendsErrorNotification(errorMessage)
    })
  })

  describe('when the user introduces an invalid lobby id', () => {
    test('sends error notification', async () => {
      const homeView = mountHomeView()

      await userJoinsLobby(homeView, 'string-instead-of-number')

      sendsErrorNotification('Invalid lobby id')
    })
  })

  /**
   * Mounts HomeView
   * @returns The mounted HomeView component
   */
  const mountHomeView = (): VueWrapper => mount(HomeView)

  /**
   * Each lobby has a quiz associated with it, so we mock the returned quiz simulating
   * that the lobby has that quiz running.
   * @param quizId The quiz id returned by the service
   */
  const lobbyRunningQuiz = (quiz: Quiz): void => {
    container.quizService.getQuizByLobbyId.mockResolvedValue(quiz)
    return
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
  const userJoinsLobby = async (wrapper: VueWrapper, lobby: Lobby | string): Promise<void> => {
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
  const redirectsToLobbyWithRunningQuiz = (wrapper: VueWrapper, lobby: Lobby, quiz: Quiz): void => {
    expect(wrapper.router.push).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'player-lobby', params: { lobbyId: lobby.id.toString(), quizId: quiz.id.toString() } })
    )
  }
})
