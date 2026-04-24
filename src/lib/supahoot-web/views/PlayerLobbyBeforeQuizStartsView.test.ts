import MockComponent from '@/test/support/MockComponent.vue'
import {
  container,
  notificationProvider,
  playerProvider,
} from '@/test/support/setup-container-mock'
import { testId } from '@/test/support/utils/html-utils'
import { mount, VueWrapper } from '@vue/test-utils'
import { getRouter, type RouterMock } from 'vue-router-mock'
import PlayerLobbyBeforeQuizStartsView from './PlayerLobbyBeforeQuizStartsView.vue'

let wrapper: VueWrapper
let router: RouterMock

describe('PlayerLobbyBeforeQuizStartsView', () => {
  beforeEach(() => {
    router = getRouter()
    router.setParams({ lobbyId: '1', quizId: '1' })
    router.addRoute({
      name: 'player-quizz',
      path: '/quiz/:quizId/lobby/:lobbyId/quiz-started',
      component: MockComponent,
    })

    playerProvider.player = { id: 1, username: 'Player 1', image: '/dummy_avatar.png' }

    container.quizService.listenQuizStart.mockImplementation(
      (_lobbyId: number, callback: () => void) => {
        callback()
      },
    )

    wrapper = mount(PlayerLobbyBeforeQuizStartsView)
  })

  describe('when player is in lobby', () => {
    test('shows player avatar', () => {
      expect(wrapper.get(testId('player-avatar')).attributes('src')).toBe('/dummy_avatar.png')
    })

    test('shows player username', () => {
      expect(wrapper.get(testId('player-username')).text()).toBe('Player 1')
    })
  })

  describe('when quiz starts', () => {
    test("redirects to player's lobby", async () => {
      expect(router.push).toHaveBeenLastCalledWith({
        name: 'player-quiz',
        params: { quizId: 1, lobbyId: 1 },
      })
    })
  })
})

describe('PlayerLobbyBeforeQuizStarts when player is not provided', () => {
  beforeEach(() => {
    router = getRouter()
    router.addRoute({ path: '/', component: MockComponent, name: 'home' })

    playerProvider.player = null

    wrapper = mount(PlayerLobbyBeforeQuizStartsView)
  })

  test('error: shows error message when player is not provided', () => {
    expect(notificationProvider.showNotification).toBeCalledWith('Error: Player not found')
  })

  test('error: redirect to home when player is not provided', () => {
    expect(router.currentRoute.value).toMatchObject({ name: 'home' })
  })
})
