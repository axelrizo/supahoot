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

  test("success: lobby should be empty when user don't create any lobby", () => {
    const wrapper = mount(HomeView)

    expect(wrapper.find(lobbyHelpers.card).exists()).toBe(false)
  })

  test('success: lobby should display new lobby name when user create a new one', async () => {
    const newLobbyName = 'New Lobby'
    const wrapper = mount(HomeView)

    await wrapper.find(lobbyHelpers.createButton).trigger('click')
    await wrapper.find(lobbyHelpers.nameInput).setValue(newLobbyName)
    await wrapper.find(lobbyHelpers.createForm).trigger('submit')

    expect(wrapper.find(lobbyHelpers.card).text()).toContain(newLobbyName)
  })

  test('error: lobby name is not displayed when lobby service fail', async () => {
    const newLobby = 'newLobby'
    const wrapper = mount(HomeView)

    container.lobbyService.create.mockRejectedValue(new Error('Error'))

    await wrapper.find(lobbyHelpers.createButton).trigger('click')
    await wrapper.find(lobbyHelpers.nameInput).setValue(newLobby)
    await wrapper.find(lobbyHelpers.createForm).trigger('submit')

    expect(wrapper.find(lobbyHelpers.card).exists()).toBe(false)
  })
})
