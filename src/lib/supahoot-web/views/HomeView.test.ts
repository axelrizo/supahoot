import MockComponent from '@/test/support/MockComponent.vue'
import { container, notificationProvider } from '@/test/support/setup-container-mock'
import { testId } from '@/test/support/utils/html-utils'
import HomeView from '@supahoot-web/views/HomeView.vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { getRouter, type RouterMock } from 'vue-router-mock'

let wrapper: VueWrapper
let router: RouterMock

describe('HomeView', () => {
  beforeEach(() => {
    router = getRouter()
    router.addRoute({
      path: '/quiz/:quizId/lobby/:lobbyId',
      name: 'player-lobby',
      component: MockComponent,
    })

    wrapper = mount(HomeView)
  })

  describe('when lobby exists and user joins', () => {
    test('redirects to lobby', async () => {
      serviceHasLobbyWithQuizzId(10)

      await userJoinsLobby(1)

      expectRedirectUserToLobbyWithQuiz(1, 10)
    })
  })

  describe('when service throws an error', () => {
    test('sends error notification', async () => {
      quizServiceThrowsError('Dummy error')

      await userJoinsLobby(1)

      expectErrorNotification('Dummy error')
    })
  })

  describe('when lobby id is invalid', () => {
    test('sends error notification', async () => {
      await userJoinsLobbyWithString('invalid')

      expectErrorNotification('Invalid lobby id')
    })
  })

  /**
   * Mocks the quiz service to return a quiz for the given lobby id
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
   * @param lobbyId The lobby id to join
   */
  const userJoinsLobby = async (lobbyId: number): Promise<void> => {
    await wrapper.get(testId('join-lobby-input')).setValue(lobbyId.toString())
    await wrapper.get(testId('join-lobby-form')).trigger('submit')
    return
  }

  /**
   * Simulates the user joining a lobby by filling the form and submitting it with a string value
   * @param lobbyId The lobby id to join as a string
   */
  const userJoinsLobbyWithString = async (lobbyId: string): Promise<void> => {
    await wrapper.get(testId('join-lobby-input')).setValue(lobbyId)
    await wrapper.get(testId('join-lobby-form')).trigger('submit')
    return
  }

  /**
   * Expects the user to receive an error notification
   * @param error The error message in the notification
   */
  const expectErrorNotification = (error: string): void => {
    expect(notificationProvider.showNotification).toHaveBeenCalledWith(`Error: ${error}`)
  }

  /**
   * User is redirected to the lobby and quiz
   * @param lobbyId The lobby id the user should be redirected to
   * @param quizId The quiz id the user should be redirected to
   */
  const expectRedirectUserToLobbyWithQuiz = (lobbyId: number, quizId: number): void => {
    expect(router.currentRoute.value).toMatchObject({
      name: 'player-lobby',
      params: { lobbyId: lobbyId.toString(), quizId: quizId.toString() },
    })
  }
})
