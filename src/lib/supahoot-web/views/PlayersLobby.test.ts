import { container } from '@/test/support/setup-container-mock'
import { testId } from '@/test/support/utils/html-utils'
import { mount, type VueWrapper } from '@vue/test-utils'
import { getRouter, type RouterMock } from 'vue-router-mock'
import PlayersLobby from './PlayersLobby.vue'

let wrapper: VueWrapper
let router: RouterMock

describe('PlayersLobby', () => {
  beforeEach(() => {
    router = getRouter()
    router.setParams({ lobbyId: 1 })

    wrapper = mount(PlayersLobby)
  })

  test('success: send its username and lobbyId to service to create the player', () => {
    wrapper.get(testId('player-username-input')).setValue('Player 1')
    wrapper.get(testId('player-form')).trigger('submit')

    expect(container.quizService.createPlayerByLobbyId).toHaveBeenCalledWith(1, 'Player 1')
  })
})
