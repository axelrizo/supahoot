import type { Player } from '@/lib/supahoot/quizzes/player'
import type { PlayerAnswer } from '@/lib/supahoot/quizzes/player-answer'
import type { QuestionWithAnswers } from '@/lib/supahoot/quizzes/question'
import { container, playerProvider } from '@/test/support/setup-container-mock'
import { HTMLUtils } from '@/test/support/utils/html-utils'
import { flushPromises, mount } from '@vue/test-utils'
import { getRouter, type RouterMock } from 'vue-router-mock'
import PlayerQuizView from './PlayerQuizView.vue'

const PLAYER_SECTION = HTMLUtils.testId('player-section')
const BEFORE_ANSWER_STAGE = HTMLUtils.testId('before-answer-stage')
const ANSWERING_STAGE = HTMLUtils.testId('answering-stage')
const PLAYER_POINTS_STAGE = HTMLUtils.testId('player-points-stage')

const pageParams = { quizId: 10, lobbyId: 20 }
const playerProfile: Player = { id: 1, image: '/image', username: 'Username' }

const question: QuestionWithAnswers = {
  id: 30,
  order: 1,
  image: '/image',
  title: 'Title',
  answers: [
    { id: 40, title: 'Answer 1', isCorrect: true, order: 1 },
    { id: 50, title: 'Answer 2', isCorrect: false, order: 2 },
    { id: 60, title: 'Answer 3', isCorrect: false, order: 3 },
    { id: 70, title: 'Answer 4', isCorrect: false, order: 4 },
  ],
}

const playerAnswer: PlayerAnswer = {
  id: 1,
  playerId: 1,
  answerId: 1,
  points: 100,
}

let router: RouterMock

beforeEach(() => {
  router = getRouter()
  router.setParams(pageParams)

  playerProvider.player = playerProfile
})

describe('PlayerQuizView', () => {
  test('success: render player section', () => {
    const wrapper = mount(PlayerQuizView)

    const $player = wrapper.find(PLAYER_SECTION)
    expect($player.exists()).toBe(true)
  })

  test('success: show player username', () => {
    const wrapper = mount(PlayerQuizView)

    const username = wrapper.get(`${PLAYER_SECTION} ${HTMLUtils.testId('username')}`)
    expect(username.text()).toContain(playerProfile.username)
  })

  test('success: show player image', () => {
    const wrapper = mount(PlayerQuizView)

    const image = wrapper.get(`${PLAYER_SECTION} ${HTMLUtils.testId('image')}`)
    expect(image.attributes('src')).toContain(playerProfile.image)
  })

  test('success: show player points', () => {
    const wrapper = mount(PlayerQuizView)

    const points = wrapper.get(`${PLAYER_SECTION} ${HTMLUtils.testId('points')}`)
    expect(points.text()).toContain('0')
  })
})

describe('PlayerQuizView before-answer-stage', () => {
  beforeEach(() => {
    container.quizService.listenQuestion.mockImplementation((_lobbyId, cb) => {
      cb(question)
    })
  })

  test.each([
    { stage: 'before-answer', selector: BEFORE_ANSWER_STAGE, exists: true },
    { stage: 'answering', selector: ANSWERING_STAGE, exists: false },
    { stage: 'player-points', selector: PLAYER_POINTS_STAGE, exists: false },
  ])(`success: show status $stage should be $exists`, async ({ selector, exists }) => {
    const wrapper = mount(PlayerQuizView)

    const $beforeAnswer = wrapper.find(selector)
    expect($beforeAnswer.exists()).toBe(exists)
  })

  test('success: show question title', async () => {
    const wrapper = mount(PlayerQuizView)
    await flushPromises()

    const title = wrapper.get(`${BEFORE_ANSWER_STAGE} ${HTMLUtils.testId('question-title')}`)
    expect(title.text()).toContain(question.title)
  })

  test('success: show timer to start answering', async () => {
    container.quizService.listenUpdateCountdownBeforeAnswer.mockImplementation((_lobbyId, cb) => {
      cb(10)
    })

    const wrapper = mount(PlayerQuizView)
    await flushPromises()

    const timer = wrapper.get(`${BEFORE_ANSWER_STAGE} ${HTMLUtils.testId('time-left')}`)
    expect(timer.text()).toContain('10')
  })
})

describe('PlayerQuizView answering-stage', () => {
  beforeEach(() => {
    container.quizService.listenUpdateCountdownBeforeAnswer.mockImplementation((_lobbyId, cb) =>
      cb(0),
    )

    container.quizService.listenQuestion.mockImplementation((_lobbyId, cb) => {
      cb(question)
    })

    container.quizService.sendAnswer.mockResolvedValue(null)
  })

  test.each([
    { stage: 'before-answer', selector: BEFORE_ANSWER_STAGE, exists: false },
    { stage: 'answering', selector: ANSWERING_STAGE, exists: true },
    { stage: 'player-points', selector: PLAYER_POINTS_STAGE, exists: false },
  ])(`success: show status $stage should be $exists`, async ({ selector, exists }) => {
    const wrapper = mount(PlayerQuizView)
    await flushPromises()

    const $beforeAnswer = wrapper.find(selector)
    expect($beforeAnswer.exists()).toBe(exists)
  })

  test('success: show question title', async () => {
    const wrapper = mount(PlayerQuizView)
    await flushPromises()

    const title = wrapper.get(`${ANSWERING_STAGE} ${HTMLUtils.testId('question-title')}`)
    expect(title.text()).toContain(question.title)
  })

  test('success: show timer to answer', async () => {
    container.quizService.listenUpdateAnsweringCountdown.mockImplementation((_lobbyId, cb) => {
      cb(5)
    })
    const wrapper = mount(PlayerQuizView)
    await flushPromises()

    const timer = wrapper.get(`${ANSWERING_STAGE} ${HTMLUtils.testId('time-left')}`)
    expect(timer.text()).toContain('5')
  })

  test('success: show answers', async () => {
    const wrapper = mount(PlayerQuizView)
    await flushPromises()

    const answers = wrapper.findAll(`${ANSWERING_STAGE} ${HTMLUtils.testId('answer')}`)
    expect(answers).toHaveLength(question.answers.length)
  })

  test('success: show answer title', async () => {
    const wrapper = mount(PlayerQuizView)
    await flushPromises()

    const $answers = wrapper.findAll(`${ANSWERING_STAGE} ${HTMLUtils.testId('answer-button')}`)
    $answers.forEach(($answer, index) => {
      expect($answer.text()).toContain(question.answers[index].title)
    })
  })

  test('success: send answer when click on answer', async () => {
    const wrapper = mount(PlayerQuizView)
    await flushPromises()

    const $answer1 = wrapper.findAll(`${ANSWERING_STAGE} ${HTMLUtils.testId('answer-button')}`)[0]
    await $answer1.trigger('click')

    expect(container.quizService.sendAnswer).toHaveBeenCalledWith(
      pageParams.lobbyId,
      playerProfile.id,
      question.id,
      question.answers[0].id,
    )
  })

  test('success: show player updated points when answered', async () => {
    container.quizService.sendAnswer.mockResolvedValue(playerAnswer)

    const wrapper = mount(PlayerQuizView)
    await flushPromises()

    const $answersButtons = wrapper.findAll(
      `${ANSWERING_STAGE} ${HTMLUtils.testId('answer-button')}`,
    )
    const $answer1 = $answersButtons[0]
    await $answer1.trigger('click')

    const points = wrapper.get(`${PLAYER_SECTION} ${HTMLUtils.testId('points')}`)
    expect(points.text()).toContain(playerAnswer.points)
  })
})

describe('PlayerQuizView answer-points', () => {
  beforeEach(() => {
    container.quizService.listenQuestion.mockImplementation((_lobbyId, cb) => {
      cb(question)
    })
    container.quizService.listenUpdateCountdownBeforeAnswer.mockImplementation((_lobbyId, cb) => {
      cb(0)
    })
  })

  test.each([
    { stage: 'before-answer', selector: BEFORE_ANSWER_STAGE, exists: false },
    { stage: 'answering', selector: ANSWERING_STAGE, exists: false },
    { stage: 'player-points', selector: PLAYER_POINTS_STAGE, exists: true },
  ])(`success: show status $stage should be $exists`, async ({ selector, exists }) => {
    const wrapper = mount(PlayerQuizView)
    await flushPromises()

    const $answersButtons = wrapper.findAll(
      `${ANSWERING_STAGE} ${HTMLUtils.testId('answer-button')}`,
    )
    await $answersButtons[0].trigger('click')

    const $playerPoints = wrapper.find(selector)
    expect($playerPoints.exists()).toBe(exists)
  })

  test('success: show player points', async () => {
    container.quizService.sendAnswer.mockResolvedValue(playerAnswer)

    const wrapper = mount(PlayerQuizView)
    await flushPromises()

    const $answersButtons = wrapper.findAll(
      `${ANSWERING_STAGE} ${HTMLUtils.testId('answer-button')}`,
    )
    await $answersButtons[0].trigger('click')

    const points = wrapper.get(`${PLAYER_POINTS_STAGE} ${HTMLUtils.testId('points')}`)
    expect(points.text()).toContain(playerAnswer.points)
  })

  test('success: show 0 points when answer is incorrect', async () => {
    container.quizService.sendAnswer.mockResolvedValue(null)

    const wrapper = mount(PlayerQuizView)
    await flushPromises()

    const $answersButtons = wrapper.findAll(
      `${ANSWERING_STAGE} ${HTMLUtils.testId('answer-button')}`,
    )
    await $answersButtons[1].trigger('click')

    const points = wrapper.get(`${PLAYER_POINTS_STAGE} ${HTMLUtils.testId('points')}`)
    expect(points.text()).toContain('0')
  })

  test('success: show answer points when answering countdown ends', async () => {
    container.quizService.listenUpdateAnsweringCountdown.mockImplementation((_lobbyId, cb) => {
      cb(0)
    })

    const wrapper = mount(PlayerQuizView)
    await flushPromises()

    const $playerPoints = wrapper.find(PLAYER_POINTS_STAGE)
    expect($playerPoints.exists()).toBe(true)
  })
})
