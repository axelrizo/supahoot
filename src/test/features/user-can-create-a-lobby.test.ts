import {
  CREATE_LOBBY_BUTTON,
  LOBBY_FORM,
  LOBBY_NAME_INPUT,
  LOBBY_TITLE,
} from '@/test/support/lobby-helpers'
import HomeView from '@supahoot-web/views/HomeView.vue'
import { mount } from '@vue/test-utils'

test('user can create a lobby', () => {
  const lobbyName = 'My Lobby'
  const wrapper = mount(HomeView)

  wrapper.find(CREATE_LOBBY_BUTTON).trigger('click')
  wrapper.find(LOBBY_NAME_INPUT).setValue(lobbyName)
  wrapper.find(LOBBY_FORM).trigger('submit')

  expect(wrapper.find(LOBBY_TITLE).text()).toContain(lobbyName)
})
