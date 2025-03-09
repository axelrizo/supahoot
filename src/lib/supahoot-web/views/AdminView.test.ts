import { quizHelpers } from '@/test/support/quiz-helpers'
import { container, notificationProvider } from '@/test/support/setup-container-mock'
import { mount, VueWrapper } from '@vue/test-utils'
import AdminView from './AdminView.vue'

let wrapper: VueWrapper

describe('AdminView', () => {
  beforeEach(() => {
    wrapper = mount(AdminView)
  })

  test('success: redirect to new view when correct word', async () => {
    container.authService.verifyAdminSecretWord.mockReturnValue(true)

    await quizHelpers.fillSecretWordAndSubmit(wrapper, 'DUMMY_WORD')

    expect(wrapper.vm.$route.path).toBe('/admin/init-quiz')
  })

  test('error: send error when secret is incorrect', async () => {
    container.authService.verifyAdminSecretWord.mockReturnValue(false)

    await quizHelpers.fillSecretWordAndSubmit(wrapper, 'DUMMY_WORD')

    expect(notificationProvider.showNotification).toHaveBeenCalledWith(
      'Error: Incorrect secret word',
    )
  })
})
