import HomeView from '@supahoot-web/views/HomeView.vue'
import { mount } from '@vue/test-utils'

test('user can create a lobby', () => {
  const wrapper = mount(HomeView)
  wrapper.find('[data-testid="create-lobby-button"]').trigger('click')
  wrapper.find('[data-testid="lobby-name-input"]').setValue('My Lobby')
  wrapper.find('[data-testid="lobby-submit-button"]').trigger('click')
  expect(wrapper.find('[data-testid="lobby-name"]').text()).toContain('My Lobby')
})
