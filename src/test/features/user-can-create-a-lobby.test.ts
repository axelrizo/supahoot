import { lobbyHelpers } from '@/test/support/lobby-helpers'
import HomeView from '@supahoot-web/views/HomeView.vue'
import { mount } from '@vue/test-utils'

test('user can create a lobby', async () => {
  const lobbyName = 'My Lobby'
  const wrapper = mount(HomeView)

  await wrapper.find(lobbyHelpers.createButton).trigger('click')
  await wrapper.find(lobbyHelpers.nameInput).setValue(lobbyName)
  await wrapper.find(lobbyHelpers.createForm).trigger('submit')

  expect(wrapper.find(lobbyHelpers.card).text()).toContain(lobbyName)
})
