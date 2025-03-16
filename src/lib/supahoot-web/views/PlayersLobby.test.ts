import { FileUtils } from '@/lib/supahoot/utils/file.utils'
import { container } from '@/test/support/setup-container-mock'
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
    router.setParams({ lobbyId: 1 })

    container.quizService.generatePlayerAvatar.mockResolvedValue(avatarFile)

    wrapper = mount(PlayersLobby)
  })

  test('success: get a generated avatar while player is filling the username input', async () => {
    await wrapper.get(testId('player-username-input')).setValue('input')
    await flushPromises()

    expect(wrapper.get(testId('player-avatar')).attributes('src')).toBe(base64ImageData)
  })
})
