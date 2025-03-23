import type { Player } from '@/lib/supahoot/quizzes/player'
import type { PlayerAnswer } from '@/lib/supahoot/quizzes/player-answer'
import type { Question } from '@/lib/supahoot/quizzes/question'
import type { QuizService } from '@/lib/supahoot/services/quiz.service'
import { container, playerProvider } from '@/test/support/setup-container-mock'
import { HTMLUtils } from '@/test/support/utils/html-utils'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { getRouter, type RouterMock } from 'vue-router-mock'
import AdminQuestionView from './AdminQuestionView.vue'

let wrapper: VueWrapper
let router: RouterMock

const routerParams = { quizId: 1, lobbyId: 2, questionOrder: 3 }
const question: Question = {
  id: 1,
  title: 'Question 1',
  order: 3,
  image: 'image.png',
  answers: [
    { id: 1, title: 'Answer 1', is_correct: false, order: 1 },
    { id: 2, title: 'Answer 2', is_correct: false, order: 2 },
    { id: 3, title: 'Answer 3', is_correct: false, order: 3 },
    { id: 4, title: 'Answer 4', is_correct: true, order: 4 },
  ],
}
const player: Player = { id: 1, username: 'Player', image: './image.png' }

const LOADING = HTMLUtils.testId('loading')
const BEFORE_QUESTION = HTMLUtils.testId('before-question')
const STARTED_QUESTION = HTMLUtils.testId('started-question')
const STATISTICS = HTMLUtils.testId('statistics')

beforeEach(() => {
  router = getRouter()
  router.setParams(routerParams)

  playerProvider.player = player
})

describe('AdminQuestionView', () => {
  beforeEach(() => {
    container.quizService.getQuestionByQuizIdAndQuestionOrder.mockResolvedValue(question)

    wrapper = mount(AdminQuestionView)
  })

  test('success: call service to get question details', () => {
    const getQuestionService = container.quizService.getQuestionByQuizIdAndQuestionOrder

    expect(getQuestionService).toHaveBeenCalledWith(routerParams.quizId, routerParams.questionOrder)
  })

  test('success: player information is displayed', () => {
    const playerUsername = wrapper.get(HTMLUtils.testId('player-username'))

    expect(playerUsername.text()).toContain(player.username)
  })

  test('success: player image is displayed', () => {
    const playerImage = wrapper.get(HTMLUtils.testId('player-image'))

    expect(playerImage.attributes('src')).toBe(player.image)
  })

  test('success: show player score and update it', async () => {
    const playerAnswer: PlayerAnswer = { playerId: 1, answerId: 1, points: 100, id: 1 }
    const implementation: QuizService['listenPlayerQuestionPoints'] = (
      _lobbyId,
      _playerId,
      callback,
    ) => {
      callback(playerAnswer)
    }

    container.quizService.listenPlayerQuestionPoints
      .mockImplementation(implementation)
      .mockImplementation(implementation)

    wrapper = mount(AdminQuestionView)

    const playerScore = wrapper.get(HTMLUtils.testId('player-score'))

    expect(playerScore.text()).toContain('0')
    await nextTick()

    expect(playerScore.text()).toContain(playerAnswer.points.toString())
  })
})

describe('AdminQuestionView when does not has question yet', () => {
  beforeEach(() => {
    container.quizService.getQuestionByQuizIdAndQuestionOrder.mockResolvedValue(
      new Promise(() => { }),
    )

    wrapper = mount(AdminQuestionView)
  })

  test('success: show loading question', () => {
    const loadingSection = wrapper.find(LOADING)

    expect(loadingSection.exists()).toBe(true)
  })

  test('success: not show before start question section', () => {
    const beforeStartQuestionContainer = wrapper.find(BEFORE_QUESTION)

    expect(beforeStartQuestionContainer.exists()).toBe(false)
  })

  test('success: not show started question section', () => {
    const startedQuestionContainer = wrapper.find(STARTED_QUESTION)

    expect(startedQuestionContainer.exists()).toBe(false)
  })

  test("success: not show question's statistics", () => {
    const questionStatistics = wrapper.find(STATISTICS)

    expect(questionStatistics.exists()).toBe(false)
  })

  test('success: show loading question', () => {
    const loadingSection = wrapper.find(LOADING)

    expect(loadingSection.exists()).toBe(true)
  })
})

describe('AdminQuestionView before start question', () => {
  beforeEach(() => {
    vi.useFakeTimers()

    container.quizService.getQuestionByQuizIdAndQuestionOrder.mockResolvedValue(question)

    wrapper = mount(AdminQuestionView, { props: { initialTimeLeftToStart: 20 } })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('success: not show loading', () => {
    const loadingSection = wrapper.find(LOADING)

    expect(loadingSection.exists()).toBe(false)
  })

  test('success: not show started question section', () => {
    const startedQuestionContainer = wrapper.find(STARTED_QUESTION)

    expect(startedQuestionContainer.exists()).toBe(false)
  })

  test("success: not show question's statistics", () => {
    const questionStatistics = wrapper.find(STATISTICS)

    expect(questionStatistics.exists()).toBe(false)
  })

  test('success: show before start question section', () => {
    const beforeStartQuestionContainer = wrapper.find(BEFORE_QUESTION)

    expect(beforeStartQuestionContainer.exists()).toBe(true)
  })

  test('success: show question title', () => {
    const beforeStartQuestionTitle = wrapper.get(
      `${BEFORE_QUESTION} > ${HTMLUtils.testId('question-title')}`,
    )

    expect(beforeStartQuestionTitle.text()).toContain(question.title)
  })

  test('success: show time left to start', () => {
    const timeLeft = wrapper.get(`${BEFORE_QUESTION} > ${HTMLUtils.testId('time-left')}`)

    expect(timeLeft.text()).toContain('20')
  })

  test('success: call the service to update countdown', async () => {
    const updateCountdownService = container.quizService.updateCountdownBeforeQuestionStart

    vi.advanceTimersToNextTimer()
    expect(updateCountdownService).toHaveBeenCalledWith(routerParams.lobbyId, 20)

    vi.advanceTimersToNextTimer()
    expect(updateCountdownService).toHaveBeenCalledWith(routerParams.lobbyId, 19)
  })
})

describe('AdminQuestionView when question has started', () => {
  beforeEach(() => {
    vi.useFakeTimers()

    container.quizService.getQuestionByQuizIdAndQuestionOrder.mockResolvedValue(question)

    wrapper = mount(AdminQuestionView, {
      props: { initialTimeLeftToStart: 0, initialTimeLeftToAnswer: 20 },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('success: not show loading', () => {
    const loadingContainer = wrapper.find(LOADING)

    expect(loadingContainer.exists()).toBe(false)
  })

  test('success: not show before start question section', () => {
    const beforeStartQuestionContainer = wrapper.find(BEFORE_QUESTION)

    expect(beforeStartQuestionContainer.exists()).toBe(false)
  })

  test("success: not show question's statistics", () => {
    const questionStatistics = wrapper.find(STATISTICS)

    expect(questionStatistics.exists()).toBe(false)
  })

  test('success: show started question section', () => {
    const startedQuestionContainer = wrapper.find(STARTED_QUESTION)

    expect(startedQuestionContainer.exists()).toBe(true)
  })

  test("success: show question's title", () => {
    const questionTitle = wrapper.find(
      `${STARTED_QUESTION} > ${HTMLUtils.testId('question-title')}`,
    )

    expect(questionTitle.text()).toContain(question.title)
  })

  test('success: show question image', () => {
    const questionImage = wrapper.get(`${STARTED_QUESTION} > ${HTMLUtils.testId('question-image')}`)

    expect(questionImage.attributes('src')).toBe(question.image)
  })

  test('success: show time to answer', () => {
    const timeToAnswer = wrapper.get(`${STARTED_QUESTION} > ${HTMLUtils.testId('time-to-answer')}`)

    expect(timeToAnswer.text()).toContain('20')
  })

  test('success: show answers', async () => {
    const answers = wrapper.findAll(`${STARTED_QUESTION} > ${HTMLUtils.testId('answer')}`)

    expect(answers).toHaveLength(question.answers.length)
  })

  test('success: answers print title', () => {
    const answersTitles = wrapper.findAll(
      `${STARTED_QUESTION} > ${HTMLUtils.testId('answer')} > ${HTMLUtils.testId('answer-title')}`,
    )

    answersTitles.forEach((answerTitle, index) => {
      expect(answerTitle.text()).toContain(question.answers[index].title)
    })
  })

  test("success: call the service to update countdown before question's start", async () => {
    const updateCountdownService = container.quizService.updateStartAnswerQuestionCountdown

    // finish the countdown to start the question
    vi.advanceTimersToNextTimer()

    vi.advanceTimersToNextTimer()
    expect(updateCountdownService).toHaveBeenCalledWith(routerParams.lobbyId, 20)

    vi.advanceTimersToNextTimer()
    expect(updateCountdownService).toHaveBeenCalledWith(routerParams.lobbyId, 19)
  })

  test('success: sends question to players in service', async () => {
    const sendQuestionService = container.quizService.sendQuestion
    await vi.advanceTimersToNextTimer()

    expect(sendQuestionService).toHaveBeenCalledWith(routerParams.lobbyId, question)
  })
})
