import { LOBBY_FORM } from '@/test/support/lobby-helpers'
import { container } from '@/test/support/setup-container-mock'
import HomeView from '@supahoot-web/views/HomeView.vue'
import { mount } from '@vue/test-utils'

describe('HomeView', () => {
  test('success: connect with service when submit form', () => {
    const wrapper = mount(HomeView)

    wrapper.find(LOBBY_FORM).trigger('submit')

    expect(container.lobbyService.create).toHaveBeenCalled()
  })
})
