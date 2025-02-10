import HomeView from '@supahoot-web/views/HomeView.vue'
import { mount } from '@vue/test-utils'

const MockLobbyService = vi.fn()
MockLobbyService.prototype.create = vi.fn()

describe('HomeView', () => {
  test('success: connect with service when submit form', () => {
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
    wrapper.find('[data-testid="lobby-form"]').trigger('submit')
    expect(lobbyService.create).toHaveBeenCalled()
  })
})
