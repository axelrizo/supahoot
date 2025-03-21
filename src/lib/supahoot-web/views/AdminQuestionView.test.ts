import { container } from '@/test/support/setup-container-mock'
import { HTMLUtils } from '@/test/support/utils/html-utils'
import { mount, type VueWrapper } from '@vue/test-utils'
import { getRouter, type RouterMock } from 'vue-router-mock'
import AdminQuestionView from './AdminQuestionView.vue'

let wrapper: VueWrapper
let router: RouterMock

beforeEach(() => {
  router = getRouter()
  router.setParams({ quizId: '1', questionOrder: '3', lobbyId: '2' })

  container.quizService.getQuestionByQuizIdAndQuestionOrder.mockResolvedValue({
    id: 1,
    title: 'Question 1',
    order: 3,
    image: 'image.png',
    answers: [{ id: 1, title: 'Answer 1', correct: false }],
  })
})

describe('AdminQuestionView', () => {
  beforeEach(() => {
    wrapper = mount(AdminQuestionView)
  })

  test('success: call service to get question details', () => {
    expect(container.quizService.getQuestionByQuizIdAndQuestionOrder).toHaveBeenCalledWith(1, 3)
  })

  test('success: question title is printed', () => {
    expect(wrapper.get(HTMLUtils.testId('question-title')).text()).toContain('Question 1')
  })
})

describe('AdminQuestionView when has time left', () => {
  beforeEach(() => {
    container.quizService.listenCountdown.mockImplementation(
      (_lobbyId: number, callback: (count: number) => void) => {
        callback(10)
      },
    )

    wrapper = mount(AdminQuestionView, { props: { countdownTimeInS: 10 } })
  })

  test('success: do not show options', () => {
    expect(wrapper.find(HTMLUtils.testId('question-answers')).exists()).toBe(false)
  })

  test('success: show time left', () => {
    expect(wrapper.get(HTMLUtils.testId('time-left')).text()).toContain('10')
  })

  test('success: do not show question image', () => {
    expect(wrapper.find(HTMLUtils.testId('question-image')).exists()).toBe(false)
  })
})

describe('AdminQuestionView when no has time left', () => {
  beforeEach(() => {
    wrapper = mount(AdminQuestionView, { props: { countdownTimeInS: 0 } })
  })

  test('success: show question image', async () => {
    expect(wrapper.get(HTMLUtils.testId('question-image')).attributes('src')).toBe('image.png')
  })

  test('success: do not show time left', async () => {
    expect(wrapper.find(HTMLUtils.testId('time-left')).exists()).toBe(false)
  })

  test('success: show answers', async () => {
    expect(wrapper.find(HTMLUtils.testId('answer-title')).text()).toBe('Answer 1')
  })
})
