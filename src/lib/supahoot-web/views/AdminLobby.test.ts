import type { Player } from '@/lib/supahoot/quizzes/player'
import type { QuizWithQuestionsWithAnswers } from '@/lib/supahoot/quizzes/quiz'
import MockComponent from '@/test/support/MockComponent.vue'
import { container } from '@/test/support/setup-container-mock'
import { HTMLUtils, testId } from '@/test/support/utils/html-utils'
import { flushPromises, mount, shallowMount, VueWrapper } from '@vue/test-utils'
import Qrcode from 'qrcode.vue'
import { nextTick } from 'vue'
import type { _RouterLinkI } from 'vue-router'
import { getRouter, type RouterMock } from 'vue-router-mock'
import AdminLobby from './AdminLobby.vue'

let router: RouterMock

const LOBBY_STAGE = HTMLUtils.testId('lobby-stage')
const BEFORE_ANSWER_STAGE = HTMLUtils.testId('before-answer-stage')
const ANSWERING_STAGE = HTMLUtils.testId('answering-stage')
const STATISTICS_STAGE = HTMLUtils.testId('statistics-stage')

const pageParams = { quizId: 2, lobbyId: 1 }

const player1: Player = { id: 1, username: 'username1', image: 'avatar1' }

const quizWithThreeQuestions: QuizWithQuestionsWithAnswers = {
  id: 1,
  name: 'Quiz 1',
  questions: [
    {
      id: 1,
      title: 'Question 1',
      image: 'image1',
      order: 1,
      answers: [
        { id: 1, title: 'Answer 1', isCorrect: true, order: 1 },
        { id: 2, title: 'Answer 2', isCorrect: false, order: 2 },
        { id: 3, title: 'Answer 3', isCorrect: false, order: 3 },
        { id: 4, title: 'Answer 4', isCorrect: false, order: 4 },
      ],
    },
    {
      id: 2,
      title: 'Question 2',
      image: 'image2',
      order: 2,
      answers: [
        { id: 5, title: 'Answer 5', isCorrect: false, order: 1 },
        { id: 6, title: 'Answer 6', isCorrect: false, order: 2 },
        { id: 7, title: 'Answer 7', isCorrect: false, order: 3 },
        { id: 8, title: 'Answer 8', isCorrect: true, order: 4 },
      ],
    },
    {
      id: 3,
      title: 'Question 3',
      image: 'image3',
      order: 3,
      answers: [
        { id: 9, title: 'Answer 9', isCorrect: false, order: 1 },
        { id: 10, title: 'Answer 10', isCorrect: true, order: 2 },
        { id: 11, title: 'Answer 11', isCorrect: false, order: 3 },
        { id: 12, title: 'Answer 12', isCorrect: false, order: 4 },
      ],
    },
  ],
}

const quizWithOneQuestion: QuizWithQuestionsWithAnswers = {
  id: 1,
  name: 'Quiz 1',
  questions: [
    {
      id: 1,
      title: 'Question 1',
      image: 'image1',
      order: 1,
      answers: [
        { id: 1, title: 'Answer 1', isCorrect: true, order: 1 },
        { id: 2, title: 'Answer 2', isCorrect: false, order: 2 },
        { id: 3, title: 'Answer 3', isCorrect: false, order: 3 },
        { id: 4, title: 'Answer 4', isCorrect: false, order: 4 },
      ],
    },
  ],
}

const answerPlayerCountMap = [
  { answerId: 1, playerCount: 10 },
  { answerId: 2, playerCount: 20 },
  { answerId: 3, playerCount: 30 },
  { answerId: 4, playerCount: 40 },
]

const clickInitializeQuiz = async (wrapper: VueWrapper) => {
  await wrapper.get(`${LOBBY_STAGE} ${testId('initialize-quiz')}`).trigger('click')
}

const finishTimeBeforeAnswer = async () => {
  vi.advanceTimersToNextTimer()
  vi.advanceTimersToNextTimer()
  await flushPromises()
}

const finishAnsweringTime = async () => {
  vi.advanceTimersToNextTimer()
  vi.advanceTimersToNextTimer()
  await flushPromises()
}

beforeEach(() => {
  router = getRouter()
  router.setParams(pageParams)
  router.addRoute({
    path: '/quiz/:quizId/lobby/:lobbyId',
    name: 'player-lobby',
    component: MockComponent,
  })
})

describe('AdminLobby lobby-stage', () => {
  beforeEach(() => {})

  test.each([
    { stage: 'before-answer', selector: BEFORE_ANSWER_STAGE },
    { stage: 'answering stage', selector: ANSWERING_STAGE },
    { stage: 'statistics stage', selector: STATISTICS_STAGE },
  ])(`success: not show $stage`, async ({ selector }) => {
    const wrapper = mount(AdminLobby)

    const $stage = wrapper.find(selector)
    expect($stage.exists()).toBe(false)
  })

  test('success: lobby render id', () => {
    const wrapper = mount(AdminLobby)

    const $lobbyId = wrapper.get(`${LOBBY_STAGE} ${testId('lobby-id')}`)
    expect($lobbyId.text()).toBe('Lobby ID: 1')
  })

  test('success: qr component is initialized with correct params', () => {
    const wrapper = shallowMount(AdminLobby)

    const playerLobbyRoute = { name: 'player-lobby', params: pageParams }
    const resolvedUserLobbyHref = router.resolve(playerLobbyRoute).href
    const expectedLink = location.origin + resolvedUserLobbyHref

    const $qrCode = wrapper.getComponent<typeof Qrcode>(`${LOBBY_STAGE} ${testId('qr-code')}`)

    expect($qrCode.props().value).toBe(expectedLink)
  })

  test('success: read players of the lobby', async () => {
    container.quizService.getPlayersByLobby.mockResolvedValue([player1, player1])

    const wrapper = mount(AdminLobby)
    await flushPromises()

    const $players = wrapper.findAll(`${LOBBY_STAGE} ${testId('player')}`)
    expect($players).toHaveLength(2)
  })

  test('success: print player username', async () => {
    container.quizService.getPlayersByLobby.mockResolvedValue([player1])

    const wrapper = mount(AdminLobby)
    await flushPromises()

    const $playerUsername = wrapper.get(`${LOBBY_STAGE} ${testId('player')} ${testId('username')}`)
    expect($playerUsername.text()).toContain(player1.username)
  })

  test("success: print player's avatars", async () => {
    container.quizService.getPlayersByLobby.mockResolvedValue([player1])

    const wrapper = mount(AdminLobby)
    await flushPromises()

    const $playerAvatar = wrapper.get(`${LOBBY_STAGE} ${testId('player')} ${testId('avatar')}`)
    expect($playerAvatar.attributes('src')).toContain(player1.image)
  })

  test('success: print all players that comes from service', async () => {
    container.quizService.getPlayersByLobby.mockResolvedValue([])
    container.quizService.startListeningForNewPlayers.mockImplementation(
      (_lobbyId: number, cb: (player: Player) => void) => {
        cb({ id: 2, username: 'user2', image: 'img2' })
      },
    )

    const wrapper = mount(AdminLobby)
    await nextTick()

    const $players = wrapper.findAll(`${LOBBY_STAGE} ${testId('player')}`)
    expect($players).toHaveLength(1)
  })

  test('success: can initialize the quiz using the service', async () => {
    const wrapper = mount(AdminLobby)

    await clickInitializeQuiz(wrapper)

    expect(container.quizService.startQuiz).toHaveBeenCalledTimes(1)
  })

  test('success: stop listening for new players when quiz initialized', async () => {
    const wrapper = mount(AdminLobby)

    await clickInitializeQuiz(wrapper)

    expect(container.quizService.stopListeningForNewPlayers).toHaveBeenCalledWith(
      pageParams.lobbyId,
    )
  })

  test('success: show before question stage when quiz initialized', async () => {
    const wrapper = mount(AdminLobby)

    await clickInitializeQuiz(wrapper)

    const $beforeQuestionStage = wrapper.find(`${BEFORE_ANSWER_STAGE}`)
    expect($beforeQuestionStage.exists()).toBe(true)
  })
})

describe('AdminLobby before-answer-stage', () => {
  beforeEach(() => {
    vi.useFakeTimers()

    container.quizService.getQuizWithQuestionsAndAnswersByQuizId.mockResolvedValue(
      quizWithThreeQuestions,
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test.each([
    { stage: 'lobby-stage', selector: LOBBY_STAGE },
    { stage: 'answering stage', selector: ANSWERING_STAGE },
    { stage: 'statistics stage', selector: STATISTICS_STAGE },
  ])(`success: not show $stage`, async ({ selector }) => {
    const wrapper = mount(AdminLobby)
    await clickInitializeQuiz(wrapper)

    const $stage = wrapper.find(selector)
    expect($stage.exists()).toBe(false)
  })

  test('success: show question title', async () => {
    container.quizService.getQuizWithQuestionsAndAnswersByQuizId.mockResolvedValue(
      quizWithThreeQuestions,
    )
    const wrapper = mount(AdminLobby)
    await clickInitializeQuiz(wrapper)

    const $questionTitle = wrapper.get(`${BEFORE_ANSWER_STAGE} ${testId('question-title')}`)
    expect($questionTitle.text()).toContain(quizWithThreeQuestions.questions[0].title)
  })

  test('success: show time left to start question and show updated time', async () => {
    const wrapper = mount(AdminLobby, { props: { timeToStartAnswering: 20 } })
    await clickInitializeQuiz(wrapper)

    const $timeLeft = wrapper.get(`${BEFORE_ANSWER_STAGE} ${testId('time-left')}`)
    expect($timeLeft.text()).toContain('20')

    vi.advanceTimersToNextTimer()
    await flushPromises()

    expect($timeLeft.text()).toContain('19')
  })

  test('success: call service to update countdown before question start', async () => {
    const countdownService = container.quizService.updateCountdownBeforeAnswer
    const wrapper = mount(AdminLobby, { props: { timeToStartAnswering: 20 } })
    await clickInitializeQuiz(wrapper)

    vi.advanceTimersToNextTimer()
    expect(countdownService).toHaveBeenCalledWith(pageParams.lobbyId, 20)

    vi.advanceTimersToNextTimer()
    expect(countdownService).toHaveBeenCalledWith(pageParams.lobbyId, 19)
  })

  test('success: call service to send question to players', async () => {
    container.quizService.getQuizWithQuestionsAndAnswersByQuizId.mockResolvedValue(
      quizWithThreeQuestions,
    )
    const sendQuestionService = container.quizService.sendQuestion
    const wrapper = mount(AdminLobby)
    await clickInitializeQuiz(wrapper)

    expect(sendQuestionService).toHaveBeenCalledWith(
      pageParams.lobbyId,
      quizWithThreeQuestions.questions[0],
    )
  })
})

describe('AdminLobby answering stage', () => {
  beforeEach(() => {
    vi.useFakeTimers()

    container.quizService.getQuizWithQuestionsAndAnswersByQuizId.mockResolvedValue(
      quizWithThreeQuestions,
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test.each([
    { stage: 'lobby-stage', selector: LOBBY_STAGE },
    { stage: 'before-answer-stage', selector: BEFORE_ANSWER_STAGE },
    { stage: 'statistics stage', selector: STATISTICS_STAGE },
  ])(`success: not show $stage`, async ({ selector }) => {
    const wrapper = mount(AdminLobby, { props: { timeToStartAnswering: 1 } })
    await clickInitializeQuiz(wrapper)
    await finishTimeBeforeAnswer()

    const $stage = wrapper.find(selector)
    expect($stage.exists()).toBe(false)
  })

  test('success: show answering stage when time to start answering is over', async () => {
    const wrapper = mount(AdminLobby, { props: { timeToStartAnswering: 1 } })
    await clickInitializeQuiz(wrapper)
    await finishTimeBeforeAnswer()

    const $beforeQuestionStage = wrapper.find(ANSWERING_STAGE)
    expect($beforeQuestionStage.exists()).toBe(true)
  })

  test('success: show time left to answer question and show updated time', async () => {
    const wrapper = mount(AdminLobby, { props: { timeToStartAnswering: 1, timeToAnswer: 20 } })
    await clickInitializeQuiz(wrapper)
    await finishTimeBeforeAnswer()

    const $timeLeft = wrapper.get(`${ANSWERING_STAGE} ${testId('time-left')}`)

    expect($timeLeft.text()).toContain('20')

    vi.advanceTimersToNextTimer()
    await flushPromises()

    expect($timeLeft.text()).toContain('19')
  })

  test('success: call service to update answering countdown', async () => {
    const countdownService = container.quizService.updateAnsweringCountdown
    const wrapper = mount(AdminLobby, { props: { timeToStartAnswering: 1, timeToAnswer: 20 } })
    await clickInitializeQuiz(wrapper)
    await finishTimeBeforeAnswer()

    vi.advanceTimersToNextTimer()
    expect(countdownService).toHaveBeenCalledWith(pageParams.lobbyId, 20)

    vi.advanceTimersToNextTimer()
    expect(countdownService).toHaveBeenCalledWith(pageParams.lobbyId, 19)
  })

  test('success: show question title', async () => {
    container.quizService.getQuizWithQuestionsAndAnswersByQuizId.mockResolvedValue(
      quizWithThreeQuestions,
    )
    const wrapper = mount(AdminLobby, { props: { timeToStartAnswering: 1, timeToAnswer: 20 } })
    await clickInitializeQuiz(wrapper)
    await finishTimeBeforeAnswer()

    const $questionTitle = wrapper.get(`${ANSWERING_STAGE} ${testId('question-title')}`)
    expect($questionTitle.text()).toContain(quizWithThreeQuestions.questions[0].title)
  })

  test('success: show question image', async () => {
    container.quizService.getQuizWithQuestionsAndAnswersByQuizId.mockResolvedValue(
      quizWithThreeQuestions,
    )
    const wrapper = mount(AdminLobby, { props: { timeToStartAnswering: 1, timeToAnswer: 20 } })
    await clickInitializeQuiz(wrapper)
    await finishTimeBeforeAnswer()

    const $questionImage = wrapper.get(`${ANSWERING_STAGE} ${testId('question-image')}`)
    expect($questionImage.attributes('src')).toBe(quizWithThreeQuestions.questions[0].image)
  })

  test('success: show questions answers', async () => {
    container.quizService.getQuizWithQuestionsAndAnswersByQuizId.mockResolvedValue(
      quizWithThreeQuestions,
    )
    const wrapper = mount(AdminLobby, { props: { timeToStartAnswering: 1, timeToAnswer: 20 } })
    await clickInitializeQuiz(wrapper)
    await finishTimeBeforeAnswer()

    const $answers = wrapper.findAll(`${ANSWERING_STAGE} ${testId('answer')}`)
    expect($answers).toHaveLength(quizWithThreeQuestions.questions[0].answers.length)
  })

  test('success: show answers tittles', async () => {
    container.quizService.getQuizWithQuestionsAndAnswersByQuizId.mockResolvedValue(
      quizWithThreeQuestions,
    )
    container.quizService.getPlayerCountPerAnswerInQuestionByLobbyIdAndQuestionId.mockResolvedValue(
      null,
    )

    const wrapper = mount(AdminLobby, { props: { timeToStartAnswering: 1, timeToAnswer: 20 } })
    await clickInitializeQuiz(wrapper)
    await finishTimeBeforeAnswer()

    const $answersTitles = wrapper.findAll(`${ANSWERING_STAGE} ${testId('answer-title')}`)
    $answersTitles.forEach(($answerTitle, index) => {
      expect($answerTitle.text()).toContain(
        quizWithThreeQuestions.questions[0].answers[index].title,
      )
    })
  })
})

describe('AdminLobby statistics stage', () => {
  beforeEach(() => {
    vi.useFakeTimers()

    container.quizService.getQuizWithQuestionsAndAnswersByQuizId.mockResolvedValue(
      quizWithThreeQuestions,
    )

    container.quizService.getPlayerCountPerAnswerInQuestionByLobbyIdAndQuestionId.mockResolvedValue(
      answerPlayerCountMap,
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test.each([
    { stage: 'lobby-stage', selector: LOBBY_STAGE },
    { stage: 'before-answer-stage', selector: BEFORE_ANSWER_STAGE },
    { stage: 'answering stage', selector: ANSWERING_STAGE },
  ])(`success: not show $stage`, async ({ selector }) => {
    const wrapper = mount(AdminLobby, { props: { timeToStartAnswering: 1, timeToAnswer: 1 } })
    await clickInitializeQuiz(wrapper)
    await finishTimeBeforeAnswer()
    await finishAnsweringTime()

    const $stage = wrapper.find(selector)
    expect($stage.exists()).toBe(false)
  })

  test('success: show statistics stage when time to answer is over', async () => {
    const wrapper = mount(AdminLobby, { props: { timeToStartAnswering: 1, timeToAnswer: 1 } })
    await clickInitializeQuiz(wrapper)
    await finishTimeBeforeAnswer()
    await finishAnsweringTime()

    const $statisticsStage = wrapper.find(STATISTICS_STAGE)
    expect($statisticsStage.exists()).toBe(true)
  })

  test('success: show question title', async () => {
    const wrapper = mount(AdminLobby, { props: { timeToStartAnswering: 1, timeToAnswer: 1 } })
    await clickInitializeQuiz(wrapper)
    await finishTimeBeforeAnswer()
    await finishAnsweringTime()

    const $questionTitle = wrapper.get(`${STATISTICS_STAGE} ${testId('question-title')}`)
    expect($questionTitle.text()).toContain(quizWithThreeQuestions.questions[0].title)
  })

  test('success: show question answers', async () => {
    const wrapper = mount(AdminLobby, { props: { timeToStartAnswering: 1, timeToAnswer: 1 } })
    await clickInitializeQuiz(wrapper)
    await finishTimeBeforeAnswer()
    await finishAnsweringTime()

    const $answers = wrapper.findAll(`${STATISTICS_STAGE} ${testId('answer')}`)
    expect($answers).toHaveLength(quizWithThreeQuestions.questions[0].answers.length)
  })

  test('success: highlight correct answer', async () => {
    const wrapper = mount(AdminLobby, { props: { timeToStartAnswering: 1, timeToAnswer: 1 } })
    await clickInitializeQuiz(wrapper)
    await finishTimeBeforeAnswer()
    await finishAnsweringTime()

    const $correctAnswer = wrapper.get(
      `${STATISTICS_STAGE} ${testId('answer')}[data-is-correct=true]`,
    )
    expect($correctAnswer.text()).toContain(quizWithThreeQuestions.questions[0].answers[0].title)
  })

  test('success: show answer title', async () => {
    const wrapper = mount(AdminLobby, { props: { timeToStartAnswering: 1, timeToAnswer: 1 } })
    await clickInitializeQuiz(wrapper)
    await finishTimeBeforeAnswer()
    await finishAnsweringTime()

    const $answersTitles = wrapper.findAll(`${STATISTICS_STAGE} ${testId('title')}`)

    $answersTitles.forEach(($answerTitle, index) => {
      expect($answerTitle.text()).toContain(
        quizWithThreeQuestions.questions[0].answers[index].title,
      )
    })
  })

  test('success: show how many players answered each answer', async () => {
    const wrapper = mount(AdminLobby, { props: { timeToStartAnswering: 1, timeToAnswer: 1 } })
    await clickInitializeQuiz(wrapper)
    await finishTimeBeforeAnswer()
    await finishAnsweringTime()

    const $answers = wrapper.findAll(`${STATISTICS_STAGE} ${testId('answer')}`)

    $answers.forEach(($answer, index) => {
      const playerCount = answerPlayerCountMap[index].playerCount
      const $playerCount = $answer.get(testId('player-count'))
      expect($playerCount.text()).toBe(playerCount.toString())
    })
  })

  test('success: send players next question when click next question', async () => {
    const wrapper = mount(AdminLobby, { props: { timeToStartAnswering: 1, timeToAnswer: 1 } })
    await clickInitializeQuiz(wrapper)
    await finishTimeBeforeAnswer()
    await finishAnsweringTime()

    const $nextQuestion = wrapper.get(`${STATISTICS_STAGE} ${testId('next-question')}`)
    await $nextQuestion.trigger('click')

    expect(container.quizService.sendQuestion).toHaveBeenCalledWith(
      pageParams.lobbyId,
      quizWithThreeQuestions.questions[1],
    )

    await finishTimeBeforeAnswer()
    await finishAnsweringTime()

    await $nextQuestion.trigger('click')

    // finishing intervals to not interrupt the next test
    await finishTimeBeforeAnswer()
    await finishAnsweringTime()

    expect(container.quizService.sendQuestion).toHaveBeenCalledWith(
      pageParams.lobbyId,
      quizWithThreeQuestions.questions[2],
    )
  })

  test('success: reset timers when click next question', async () => {
    const wrapper = mount(AdminLobby, { props: { timeToStartAnswering: 1, timeToAnswer: 1 } })
    await clickInitializeQuiz(wrapper)
    await finishTimeBeforeAnswer()
    await finishAnsweringTime()

    const $nextQuestion = wrapper.get(`${STATISTICS_STAGE} ${testId('next-question')}`)
    await $nextQuestion.trigger('click')

    await finishTimeBeforeAnswer()
    await finishAnsweringTime()
    expect(container.quizService.updateCountdownBeforeAnswer).toHaveBeenCalledTimes(4)
    expect(container.quizService.updateAnsweringCountdown).toHaveBeenCalledTimes(4)
  })

  test('success: show before question stage when click next question', async () => {
    const wrapper = mount(AdminLobby, { props: { timeToStartAnswering: 1, timeToAnswer: 1 } })
    await clickInitializeQuiz(wrapper)
    await finishTimeBeforeAnswer()
    await finishAnsweringTime()

    const $nextQuestion = wrapper.get(`${STATISTICS_STAGE} ${testId('next-question')}`)
    await $nextQuestion.trigger('click')

    const $beforeQuestionStage = wrapper.find(BEFORE_ANSWER_STAGE)
    expect($beforeQuestionStage.exists()).toBe(true)
  })

  test('success: show awards button when no more questions', async () => {
    container.quizService.getQuizWithQuestionsAndAnswersByQuizId.mockResolvedValue(
      quizWithOneQuestion,
    )
    const wrapper = mount(AdminLobby, { props: { timeToStartAnswering: 1, timeToAnswer: 1 } })
    await clickInitializeQuiz(wrapper)
    await finishTimeBeforeAnswer()
    await finishAnsweringTime()

    const $awards = wrapper.find(`${STATISTICS_STAGE} ${testId('awards-button')}`)
    expect($awards.exists()).toBe(true)
  })

  test('success: awards button redirect to awards page', async () => {
    container.quizService.getQuizWithQuestionsAndAnswersByQuizId.mockResolvedValue(
      quizWithOneQuestion,
    )
    const wrapper = mount(AdminLobby, { props: { timeToStartAnswering: 1, timeToAnswer: 1 } })
    await clickInitializeQuiz(wrapper)
    await finishTimeBeforeAnswer()
    await finishAnsweringTime()

    const $awards = wrapper.getComponent<_RouterLinkI>(
      `${STATISTICS_STAGE} ${testId('awards-button')}`,
    )
    expect($awards.props('to')).toMatchObject({
      name: 'admin-awards',
      params: { quizId: pageParams.quizId, lobbyId: pageParams.lobbyId },
    })
  })

  test('success: does not show next question button when no more questions', async () => {
    container.quizService.getQuizWithQuestionsAndAnswersByQuizId.mockResolvedValue(
      quizWithOneQuestion,
    )
    const wrapper = mount(AdminLobby, { props: { timeToStartAnswering: 1, timeToAnswer: 1 } })
    await clickInitializeQuiz(wrapper)
    await finishTimeBeforeAnswer()
    await finishAnsweringTime()

    const $awardsButton = wrapper.find(`${STATISTICS_STAGE} ${testId('awards-button')}`)
    expect($awardsButton.exists()).toBe(true)
  })

  test('success: show next question when more questions', async () => {
    const wrapper = mount(AdminLobby, { props: { timeToStartAnswering: 1, timeToAnswer: 1 } })
    await clickInitializeQuiz(wrapper)
    await finishTimeBeforeAnswer()
    await finishAnsweringTime()

    const $nextQuestion = wrapper.find(`${STATISTICS_STAGE} ${testId('next-question')}`)
    expect($nextQuestion.exists()).toBe(true)
  })

  test('success: does not show awards when more questions', async () => {
    const wrapper = mount(AdminLobby, { props: { timeToStartAnswering: 1, timeToAnswer: 1 } })
    await clickInitializeQuiz(wrapper)
    await finishTimeBeforeAnswer()
    await finishAnsweringTime()

    const $awards = wrapper.find(`${STATISTICS_STAGE} ${testId('awards-button')}`)
    expect($awards.exists()).toBe(false)
  })
})
