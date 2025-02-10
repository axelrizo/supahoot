import { lobbyHelpers } from '@/test/support/lobby-helpers'
import { container } from '@/test/support/setup-container-mock'
import HomeView from '@supahoot-web/views/HomeView.vue'
import { mount } from '@vue/test-utils'

describe('HomeView', () => {
  test('success: connect with service when submit form', () => {
    const wrapper = mount(HomeView)

    wrapper.find(lobbyHelpers.createForm).trigger('submit')

    expect(container.lobbyService.create).toHaveBeenCalled()
  })

  test('success: lobby form should be hidden', () => {
    const wrapper = mount(HomeView)

    expect(wrapper.find(lobbyHelpers.createModal).attributes('class')).toContain('hidden')
  })

  test('success: lobby form should be visible when user click on create lobby button', async () => {
    const wrapper = mount(HomeView)

    await wrapper.find(lobbyHelpers.createButton).trigger('click')

    expect(wrapper.find(lobbyHelpers.createModal).attributes('class')).not.toContain('hidden')
  })
})
