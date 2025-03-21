import type { Player } from '@/lib/supahoot/quizzes/player'
import MockComponent from '@/test/support/MockComponent.vue'
import { container, notificationProvider } from '@/test/support/setup-container-mock'
import { testId } from '@/test/support/utils/html-utils'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import Qrcode from 'qrcode.vue'
import type { _RouterLinkI } from 'vue-router'
import { getRouter, type RouterMock } from 'vue-router-mock'
import AdminLobby from './AdminLobby.vue'

let wrapper: VueWrapper
let router: RouterMock

beforeEach(() => {
  container.quizService.getPlayersByLobby.mockResolvedValue([
    { id: 1, username: 'user1', image: 'img1' },
  ])
  container.quizService.startListeningForNewPlayers.mockImplementation(
    (_lobbyId: number, cb: (player: Player) => void) => {
      cb({ id: 2, username: 'user2', image: 'img2' })
    },
  )

  router = getRouter()

  router.addRoute({
    path: '/quiz/:quizId/lobby/:lobbyId',
    name: 'player-lobby',
    component: MockComponent,
  })
  router.addRoute({
    path: '/admin/quiz/:quizId/lobby/:lobbyId/question/:questionOrder',
    name: 'admin-quiz',
    component: MockComponent,
  })

  router.setParams({ quizId: 1, lobbyId: 1 })

  wrapper = mount(AdminLobby)
})

describe('AdminLobby', () => {
  test('success: lobby render id', () => {
    expect(wrapper.get(testId('lobby-id')).text()).toBe('Lobby ID: 1')
  })

  test('success: qr component is initialized with correct params', () => {
    const resolvedUserLobbyHref = router.resolve({
      name: 'player-lobby',
      params: { lobbyId: 1 },
    }).href
    const expectedLink = location.origin + resolvedUserLobbyHref

    const path = wrapper.getComponent(Qrcode).props().value

    expect(path).toBe(expectedLink)
  })

  test('success: read players of the lobby', () => {
    expect(wrapper.findAll(testId('player'))[0].get(testId('player-username')).text()).toContain(
      'user1',
    )
  })

  test("success: print player's image", () => {
    expect(wrapper.findAll(testId('player'))[0].get(testId('player-image')).attributes('src')).toBe(
      'img1',
    )
  })

  test('success: print all players that comes from service', () => {
    expect(wrapper.findAll(testId('player'))[1].get(testId('player-username')).text()).toContain(
      'user2',
    )
  })

  test('success: stop listening for new players when unmounted', () => {
    wrapper.unmount()

    expect(container.quizService.stopListeningForNewPlayers).toHaveBeenCalledWith(1)
  })

  test('success: can initialize the quiz', async () => {
    const path = await wrapper
      .getComponent<_RouterLinkI>(testId('initialize-quiz-button'))
      .props('to')

    expect(path).toStrictEqual({
      name: 'admin-quiz',
      params: { quizId: 1, lobbyId: 1, questionOrder: 1 },
    })
  })

  test('success: send a message to the service when a quiz is initialized', async () => {
    await wrapper.find(testId('initialize-quiz-button')).trigger('click')

    expect(container.quizService.startQuiz).toHaveBeenCalledWith(1)
  })

  test('success: redirect to the first question when a quiz is initialized', async () => {
    await wrapper.find(testId('initialize-quiz-button')).trigger('click')

    expect(router.currentRoute.value).toMatchObject({
      name: 'admin-quiz',
      params: { quizId: '1', lobbyId: '1', questionOrder: '1' },
    })
  })

  test('error: show notification when start quiz fails', async () => {
    container.quizService.startQuiz.mockRejectedValue(new Error('Failed to start quiz'))

    await wrapper.find(testId('initialize-quiz-button')).trigger('click')

    expect(notificationProvider.showNotification).toHaveBeenCalledWith(
      'Error: Failed to start quiz',
    )
  })

  test('error: send error when stop listening for new players fails', async () => {
    container.quizService.stopListeningForNewPlayers.mockRejectedValue(
      new Error('Failed to unsubscribe'),
    )

    wrapper.unmount()
    await flushPromises()

    expect(notificationProvider.showNotification).toHaveBeenCalledWith(
      'Error: Failed to unsubscribe',
    )
  })
})
