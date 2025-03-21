import MockComponent from '@/test/support/MockComponent.vue'
import { notificationProvider, playerProvider } from '@/test/support/setup-container-mock'
import { testId } from '@/test/support/utils/html-utils'
import { mount, VueWrapper } from '@vue/test-utils'
import { getRouter, type RouterMock } from 'vue-router-mock'
import PlayerLobbyBeforeQuizStarts from './PlayerLobbyBeforeQuizStarts.vue'

let wrapper: VueWrapper
let router: RouterMock

describe('PlayerLobbyBeforeQuizStarts', () => {
  beforeEach(() => {
    playerProvider.player = { id: 1, username: 'Player 1', image: '/dummy_avatar.png' }

    wrapper = mount(PlayerLobbyBeforeQuizStarts)
  })

  test('success: shows player avatar', () => {
    expect(wrapper.get(testId('player-avatar')).attributes('src')).toBe('/dummy_avatar.png')
  })

  test('success: shows player username', () => {
    expect(wrapper.get(testId('player-username')).text()).toBe('Player 1')
  })
})

describe('PlayerLobbyBeforeQuizStarts when player is not provided', () => {
  beforeEach(() => {
    router = getRouter()
    router.addRoute({ path: '/', component: MockComponent, name: 'home' })

    playerProvider.player = null

    wrapper = mount(PlayerLobbyBeforeQuizStarts)
  })

  test('error: shows error message when player is not provided', () => {
    expect(notificationProvider.showNotification).toBeCalledWith('Error: Player not found')
  })

  test('error: redirect to home when player is not provided', () => {
    expect(router.currentRoute.value).toMatchObject({ name: 'home' })
  })
})
