import MockComponent from '@/test/support/MockComponent.vue'
import { testId } from '@/test/support/utils/html-utils'
import HomeView from '@supahoot-web/views/HomeView.vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { getRouter, type RouterMock } from 'vue-router-mock'

let wrapper: VueWrapper
let router: RouterMock

describe('Home', () => {
  beforeEach(() => {
    router = getRouter()
    router.addRoute({ path: '/lobby/:lobbyId', name: 'player-lobby', component: MockComponent })

    wrapper = mount(HomeView)
  })

  test('success: player can join a lobby with the lobby id', async () => {
    await wrapper.get(testId('join-lobby-input')).setValue('1')
    await wrapper.get(testId('join-lobby-form')).trigger('submit')

    expect(router.currentRoute.value).toMatchObject({
      name: 'player-lobby',
      params: { lobbyId: '1' },
    })
  })
})
