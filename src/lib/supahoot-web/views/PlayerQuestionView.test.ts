import { container, playerProvider } from '@/test/support/setup-container-mock'
import { HTMLUtils } from '@/test/support/utils/html-utils'
import { type PlayerAnswer } from '@supahoot/quizzes/player-answer'
import type { Question } from '@supahoot/quizzes/question'
import { mount, type VueWrapper } from '@vue/test-utils'
import { getRouter, type RouterMock } from 'vue-router-mock'
import PlayerQuestionView from './PlayerQuestionView.vue'

let wrapper: VueWrapper
let router: RouterMock

beforeEach(() => {
  router = getRouter()
  router.setParams({ quizId: '1', questionOrder: '3', lobbyId: '2' })
})

describe('PlayerQuestionView', () => {
  beforeEach(() => {
    container.quizService.listenCountdown.mockImplementation(
      (_lobbyId: number, callback: (count: number) => void) => {
        callback(15)
      },
    )

    playerProvider.player = { id: 1, username: 'Player 1', image: '/image' }

    wrapper = mount(PlayerQuestionView)
  })

  test('success: display the countdown', () => {
    expect(wrapper.get(HTMLUtils.testId('time-left')).text()).toContain('15')
  })

  test('success: not display the button to answer the question', () => {
    expect(wrapper.findAll(HTMLUtils.testId('answer-button'))).toHaveLength(0)
  })

  test('success: display username', () => {
    expect(wrapper.get(HTMLUtils.testId('username')).text()).toContain('Player 1')
  })

  test('success: display image', () => {
    expect(wrapper.get(HTMLUtils.testId('image')).attributes('src')).toContain('/image')
  })
})

describe('PlayerQuestion when no time left', () => {
  beforeEach(() => {
    container.quizService.listenCountdown.mockImplementation(
      (_lobbyId: number, callback: (count: number) => void) => {
        callback(0)
      },
    )

    container.quizService.listenQuestion.mockImplementation(
      (_lobbyId: number, callback: (question: Question) => void) => {
        callback({
          id: 1,
          order: 1,
          title: 'What is the capital of France?',
          image: 'image.png',
          answers: [
            { id: 1, title: 'Paris', is_correct: true, order: 1 },
            { id: 2, title: 'London', is_correct: false, order: 2 },
            { id: 3, title: 'Madrid', is_correct: false, order: 3 },
            { id: 4, title: 'Berlin', is_correct: false, order: 4 },
          ],
        })
      },
    )

    container.quizService.listenPlayerQuestionPoints.mockImplementation(
      (_lobbyId: number, _playerId: number, callback: (payload: PlayerAnswer) => void) => {
        callback({ playerId: 1, answerId: 1, points: 100, id: 1 })
      },
    )

    playerProvider.player = { id: 1, username: 'Player 1', image: '/image' }

    wrapper = mount(PlayerQuestionView)
  })

  test('success: does not display the countdown when it is 0', () => {
    expect(wrapper.find(HTMLUtils.testId('time-left')).exists()).toBe(false)
  })

  test('success: display the button to answer the question', () => {
    expect(wrapper.findAll(HTMLUtils.testId('answer-button'))).toHaveLength(4)
  })

  test('success: send the answer when click on the button', async () => {
    const lobbyId = 2
    const playerId = 1

    await wrapper.findAll(HTMLUtils.testId('answer-button'))[0].trigger('click')

    expect(container.quizService.sendAnswer).toHaveBeenCalledWith(lobbyId, playerId, 1)
  })

  test('success: does not show answers when answered', async () => {
    await wrapper.findAll(HTMLUtils.testId('answer-button'))[0].trigger('click')

    expect(wrapper.findAll(HTMLUtils.testId('answer-button'))).toHaveLength(0)
  })

  test('success: once show if the answer is correct', async () => {
    await wrapper.findAll(HTMLUtils.testId('answer-button'))[0].trigger('click')

    expect(wrapper.get(HTMLUtils.testId('correct-answer')).text()).toContain('Correct')
  })

  test('success: once show if the answer is incorrect', async () => {
    await wrapper.findAll(HTMLUtils.testId('answer-button'))[1].trigger('click')

    expect(wrapper.get(HTMLUtils.testId('correct-answer')).text()).toContain('Incorrect')
  })

  test('success: show points when answered', async () => {
    await wrapper.findAll(HTMLUtils.testId('answer-button'))[0].trigger('click')

    expect(wrapper.get(HTMLUtils.testId('points')).text()).toContain('100')
  })
})
