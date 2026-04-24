import { container, notificationProvider } from '@/test/support/setup-container-mock'
import { testId } from '@/test/support/utils/html-utils'
import HomeView from '@supahoot-web/views/HomeView.vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { expectErrorNotification } from '@/test/support/utils/expect-utils'

describe('HomeView', () => {
  describe('when lobby exists and user joins', () => {
    test('redirects to lobby', async () => {
      const homeView = mountHomeView()
      serviceHasLobbyWithQuizzId(10)

      await userJoinsLobby(homeView, 1)

      expectRedirectUserToPlayerLobbyWithQuiz(homeView, 1, 10)
    })
  })

  describe('when service throws an error', () => {
    test('sends error notification', async () => {
      const homeView = mountHomeView()
      quizServiceThrowsError('Dummy error')

      await userJoinsLobby(homeView, 1)

      expectErrorNotification('Dummy error')
    })
  })

  describe('when lobby id is invalid', () => {
    test('sends error notification', async () => {
      const homeView = mountHomeView()

      await userJoinsLobbyWithString(homeView, 'invalid')

      expectErrorNotification('Invalid lobby id')
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
  const serviceHasLobbyWithQuizzId = (quizId: number): void => {
    container.quizService.getQuizByLobbyId.mockResolvedValue({ id: quizId, name: 'Any Quiz Name' })
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
   * @param lobbyId The lobby id to join
   */
  const userJoinsLobby = async (wrapper: VueWrapper, lobbyId: number): Promise<void> => {
    await wrapper.get(testId('join-lobby-input')).setValue(lobbyId.toString())
    await wrapper.get(testId('join-lobby-form')).trigger('submit')
    return
  }

  /**
   * Simulates the user joining a lobby by filling the form and submitting it with a string value
   * @param wrapper The mounted HomeView component
   * @param lobbyId The lobby id to join as a string
   */
  const userJoinsLobbyWithString = async (wrapper: VueWrapper, lobbyId: string): Promise<void> => {
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
  const expectRedirectUserToPlayerLobbyWithQuiz = (wrapper: VueWrapper, lobbyId: number, quizId: number): void => {
    expect(wrapper.router.push).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'player-lobby', params: { lobbyId: lobbyId.toString(), quizId: quizId.toString() } })
    )
  }
})
