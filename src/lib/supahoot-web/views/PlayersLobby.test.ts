import { container } from '@/test/support/setup-container-mock'
import { testId } from '@/test/support/utils/html-utils'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { getRouter, type RouterMock } from 'vue-router-mock'
import PlayersLobby from './PlayersLobby.vue'

let wrapper: VueWrapper
let router: RouterMock

describe('PlayersLobby', () => {
  beforeEach(() => {
    router = getRouter()
    router.setParams({ lobbyId: 1 })

    container.quizService.generatePlayerAvatar.mockResolvedValue('avatar.png')

    wrapper = mount(PlayersLobby)
  })

  test('success: get a generated avatar while you are filling the username input', async () => {
    wrapper.get(testId('player-username-input')).setValue('Player 1')
    wrapper.get(testId('player-username-input')).trigger('input')

    await flushPromises()

    expect(wrapper.get(testId('player-avatar')).attributes('src')).toBe('avatar.png')
  })
})
