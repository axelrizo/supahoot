import { lobbyHelpers } from '@/test/support/lobby-helpers'
import HomeView from '@supahoot-web/views/HomeView.vue'
import { mount } from '@vue/test-utils'

const NEW_LOBBY = 'My Lobby'

test('user can create a lobby', async () => {
  const wrapper = mount(HomeView)

  await lobbyHelpers.openFillAndSubmitForm(wrapper, NEW_LOBBY)

  expect(wrapper.find(lobbyHelpers.card).text()).toContain(NEW_LOBBY)
})
