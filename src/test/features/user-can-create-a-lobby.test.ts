import HomeView from '@supahoot-web/views/HomeView.vue'
import { mount } from '@vue/test-utils'

const MockLobbyService = vi.fn()
MockLobbyService.prototype.create = vi.fn()

test('user can create a lobby', () => {
  const lobbyService = new MockLobbyService()

  const wrapper = mount(HomeView, {
    global: {
      provide: {
        container: {
          lobbyService: lobbyService,
        },
      },
    },
  })
  wrapper.find('[data-testid="create-lobby-button"]').trigger('click')
  wrapper.find('[data-testid="lobby-name-input"]').setValue('My Lobby')
  wrapper.find('[data-testid="lobby-form"]').trigger('submit')
  expect(wrapper.find('[data-testid="lobby-name"]').text()).toContain('My Lobby')
})
