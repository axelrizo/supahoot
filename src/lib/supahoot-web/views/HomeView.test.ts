import { lobbyHelpers } from '@/test/support/lobby-helpers'
import { container, notificationProvider } from '@/test/support/setup-container-mock'
import HomeView from '@supahoot-web/views/HomeView.vue'
import { mount, VueWrapper } from '@vue/test-utils'

const NEW_LOBBY = 'New Lobby'
let wrapper: VueWrapper

describe('HomeView', () => {
  beforeEach(() => {
    wrapper = mount(HomeView)
  })

  test('success: connect with service when submit form', () => {
    wrapper.find(lobbyHelpers.createForm).trigger('submit')

    expect(container.lobbyService.create).toHaveBeenCalled()
  })

  test('success: lobby form should be hidden by default', () => {
    expect(wrapper.find(lobbyHelpers.createModal).attributes('class')).toContain('hidden')
  })

  test('success: lobby form should be visible when user click on create lobby button', async () => {
    await wrapper.find(lobbyHelpers.createButton).trigger('click')

    expect(wrapper.find(lobbyHelpers.createModal).attributes('class')).not.toContain('hidden')
  })

  test("success: lobby list should be empty when user don't create any lobby", () => {
    expect(wrapper.find(lobbyHelpers.card).exists()).toBe(false)
  })

  test('success: lobby should display new lobby name in lobby list when user create a new one', async () => {
    await lobbyHelpers.openFillAndSubmitForm(wrapper, NEW_LOBBY)

    expect(wrapper.find(lobbyHelpers.card).text()).toContain(NEW_LOBBY)
  })

  test('success: modal should be closed after submit', async () => {
    await lobbyHelpers.openFillAndSubmitForm(wrapper, NEW_LOBBY)

    expect(wrapper.find(lobbyHelpers.createModal).attributes('class')).toContain('hidden')
  })

  test('error: lobby name is not displayed when lobby service fail', async () => {
    container.lobbyService.create.mockRejectedValue(new Error('Error'))

    await lobbyHelpers.openFillAndSubmitForm(wrapper, NEW_LOBBY)

    expect(wrapper.find(lobbyHelpers.card).exists()).toBe(false)
  })

  test('error: show error notification when lobby service fail in create a lobby', async () => {
    container.lobbyService.create.mockRejectedValue(new Error('Error'))

    await lobbyHelpers.openFillAndSubmitForm(wrapper, NEW_LOBBY)

    expect(notificationProvider.showNotification).toHaveBeenCalledWith(
      'Error: Lobby creation failed',
    )
  })
})
