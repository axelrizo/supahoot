import { lobbyHelpers } from '@/test/support/lobby-helpers'
import HomeView from '@supahoot-web/views/HomeView.vue'
import { mount } from '@vue/test-utils'

test('user can create a lobby', () => {
  const lobbyName = 'My Lobby'
  const wrapper = mount(HomeView)

  wrapper.find(lobbyHelpers.createButton).trigger('click')
  wrapper.find(lobbyHelpers.nameInput).setValue(lobbyName)
  wrapper.find(lobbyHelpers.createForm).trigger('submit')

  expect(wrapper.find(lobbyHelpers.card).text()).toContain(lobbyName)
})
