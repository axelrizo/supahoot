import { FileUtils } from '@/lib/supahoot/utils/file.utils'
import MockComponent from '@/test/support/MockComponent.vue'
import {
  container,
  notificationProvider,
  playerProvider,
} from '@/test/support/setup-container-mock'
import { testId } from '@/test/support/utils/html-utils'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { getRouter, type RouterMock } from 'vue-router-mock'
import PlayersLobby from './PlayersLobby.vue'

let wrapper: VueWrapper
let router: RouterMock

const avatarFile = new File([''], 'avatar.jpeg', { type: 'image/jpeg' })

const base64ImageData = 'data:image/jpeg;base64,'
vi.spyOn(FileUtils, 'fileToDataURL').mockResolvedValue(base64ImageData)

describe('PlayersLobby', () => {
  beforeEach(() => {
    router = getRouter()

    router.setParams({ quizId: 1, lobbyId: 1 })

    router.addRoute({
      path: '/quiz/:quizId/lobby/:lobbyId',
      name: 'player-lobby-before-quiz-starts',
      component: MockComponent,
    })

    container.avatarService.generateAvatarByString.mockResolvedValue(avatarFile)

    container.quizService.createPlayerByLobbyId.mockResolvedValue({
      id: 1,
      username: 'Player 1',
      avatar: '/dummy_avatar.png',
    })

    wrapper = mount(PlayersLobby)
  })

  test('success: get a generated avatar while player is filling the username input', async () => {
    await wrapper.get(testId('player-username-input')).setValue('input')
    await flushPromises()

    expect(wrapper.get(testId('player-avatar')).attributes('src')).toBe(base64ImageData)
  })

  test('success: send its username, lobbyId and avatar to service to create the player', async () => {
    await wrapper.get(testId('player-username-input')).setValue('Player 1')
    await wrapper.get(testId('player-form')).trigger('submit')

    expect(container.quizService.createPlayerByLobbyId).toHaveBeenCalledWith(
      1,
      'Player 1',
      avatarFile,
    )
  })

  test('success: user is stored in user provider after creation', async () => {
    await wrapper.get(testId('player-username-input')).setValue('Player 1')
    await wrapper.get(testId('player-form')).trigger('submit')

    expect(playerProvider.player).toEqual({
      id: 1,
      username: 'Player 1',
      avatar: '/dummy_avatar.png',
    })
  })

  test('success: redirect player to before quiz starts page', async () => {
    await wrapper.get(testId('player-username-input')).setValue('Player 1')
    await wrapper.get(testId('player-form')).trigger('submit')

    expect(router.currentRoute.value).toMatchObject({
      name: 'player-lobby-before-quiz-starts',
      params: { quizId: '1', lobbyId: '1' },
    })
  })

  test('error: username should be at least 4 characters long', async () => {
    await wrapper.get(testId('player-username-input')).setValue('123')
    await wrapper.get(testId('player-form')).trigger('submit')

    expect(notificationProvider.showNotification).toHaveBeenCalledWith(
      'Error: Username should be at least 4 characters long',
    )
  })

  test('error: show notification when player creation fails', async () => {
    container.quizService.createPlayerByLobbyId.mockRejectedValue(
      new Error('Error: Failed to create player'),
    )

    await wrapper.get(testId('player-username-input')).setValue('Player 1')
    await wrapper.get(testId('player-form')).trigger('submit')

    expect(notificationProvider.showNotification).toHaveBeenCalledWith(
      'Error: Failed to create player',
    )
  })
})
