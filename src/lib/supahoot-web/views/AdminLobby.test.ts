import type { Player } from '@/lib/supahoot/quizzes/player'
import type { QuizWithQuestionsWithAnswers } from '@/lib/supahoot/quizzes/quiz'
import MockComponent from '@/test/support/MockComponent.vue'
import { container } from '@/test/support/setup-container-mock'
import { HTMLUtils, testId } from '@/test/support/utils/html-utils'
import { flushPromises, mount, shallowMount } from '@vue/test-utils'
import Qrcode from 'qrcode.vue'
import { getRouter, type RouterMock } from 'vue-router-mock'
import AdminLobby from './AdminLobby.vue'

let router: RouterMock

const LOBBY_STAGE = HTMLUtils.testId('lobby-stage')
const BEFORE_ANSWER_STAGE = HTMLUtils.testId('before-answer-stage')
const ANSWERING_STAGE = HTMLUtils.testId('answering-stage')

const pageParams = { quizId: 2, lobbyId: 1 }

const player1: Player = { id: 1, username: 'username1', image: 'avatar1' }

const quiz: QuizWithQuestionsWithAnswers = {
  id: 1,
  name: 'Quiz 1',
  questions: [
    {
      id: 1,
      title: 'Question 1',
      image: 'image1',
      order: 1,
      answers: [{ id: 1, title: 'Answer 1', isCorrect: true, order: 1 }],
    },
  ],
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
  test.each([
    { stage: 'before-answer', selector: BEFORE_ANSWER_STAGE },
    { stage: 'answering stage', selector: ANSWERING_STAGE },
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
    await flushPromises()

    const $players = wrapper.findAll(`${LOBBY_STAGE} ${testId('player')}`)
    expect($players).toHaveLength(1)
  })

  test('success: can initialize the quiz using the service', async () => {
    const wrapper = mount(AdminLobby)

    await wrapper.get(`${LOBBY_STAGE} ${testId('initialize-quiz')}`).trigger('click')

    expect(container.quizService.startQuiz).toHaveBeenCalledTimes(1)
  })

  test('success: stop listening for new players when quiz initialized', async () => {
    const wrapper = mount(AdminLobby)

    await wrapper.get(`${LOBBY_STAGE} ${testId('initialize-quiz')}`).trigger('click')

    expect(container.quizService.stopListeningForNewPlayers).toHaveBeenCalledWith(
      pageParams.lobbyId,
    )
  })

  test('success: show before question stage when quiz initialized', async () => {
    const wrapper = mount(AdminLobby)

    await wrapper.get(`${LOBBY_STAGE} ${testId('initialize-quiz')}`).trigger('click')

    const $beforeQuestionStage = wrapper.find(`${BEFORE_ANSWER_STAGE}`)
    expect($beforeQuestionStage.exists()).toBe(true)
  })
})

describe('AdminLobby before-answer-stage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test.each([
    { stage: 'lobby-stage', selector: LOBBY_STAGE },
    { stage: 'answering stage', selector: ANSWERING_STAGE },
  ])(`success: not show $stage`, async ({ selector }) => {
    const wrapper = mount(AdminLobby)

    await wrapper.get(`${LOBBY_STAGE} ${testId('initialize-quiz')}`).trigger('click')

    const $stage = wrapper.find(selector)
    expect($stage.exists()).toBe(false)
  })

  test('success: show question title', async () => {
    container.quizService.getQuizWithQuestionsAndAnswersByQuizId.mockResolvedValue(quiz)
    const wrapper = mount(AdminLobby)

    await wrapper.get(`${LOBBY_STAGE} ${testId('initialize-quiz')}`).trigger('click')

    const $questionTitle = wrapper.get(`${BEFORE_ANSWER_STAGE} ${testId('question-title')}`)
    expect($questionTitle.text()).toContain(quiz.name)
  })

  test('success: show time left to start question and show updated time', async () => {
    const wrapper = mount(AdminLobby, { props: { timeToStartAnswering: 20 } })
    await wrapper.get(`${LOBBY_STAGE} ${testId('initialize-quiz')}`).trigger('click')

    const $timeLeft = wrapper.get(`${BEFORE_ANSWER_STAGE} ${testId('time-left')}`)
    expect($timeLeft.text()).toContain('20')

    vi.advanceTimersToNextTimer()
    await flushPromises()

    expect($timeLeft.text()).toContain('19')
  })

  test('success: call service to update countdown before question start', async () => {
    const wrapper = mount(AdminLobby, { props: { timeToStartAnswering: 20 } })
    await wrapper.get(`${LOBBY_STAGE} ${testId('initialize-quiz')}`).trigger('click')

    vi.advanceTimersToNextTimer()
    expect(container.quizService.updateCountdownBeforeQuestionStart).toHaveBeenCalledWith(
      pageParams.lobbyId,
      20,
    )

    vi.advanceTimersToNextTimer()
    expect(container.quizService.updateCountdownBeforeQuestionStart).toHaveBeenCalledWith(
      pageParams.lobbyId,
      19,
    )
  })
})

describe('AdminLobby answering stage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test.only.each([
    { stage: 'lobby-stage', selector: LOBBY_STAGE },
    { stage: 'before-answer-stage', selector: BEFORE_ANSWER_STAGE },
  ])(`success: not show $stage`, async ({ selector }) => {
    const wrapper = mount(AdminLobby, { props: { timeToStartAnswering: 1 } })

    await wrapper.get(`${LOBBY_STAGE} ${testId('initialize-quiz')}`).trigger('click')

    vi.advanceTimersToNextTimer()
    vi.advanceTimersToNextTimer()
    await flushPromises()

    const $stage = wrapper.find(selector)
    expect($stage.exists()).toBe(false)
  })

  test('success: show question stage when time to start answering is over', async () => {
    const wrapper = mount(AdminLobby, { props: { timeToStartAnswering: 1 } })

    vi.advanceTimersToNextTimer()
    vi.advanceTimersToNextTimer()
    await flushPromises()

    const $beforeQuestionStage = wrapper.find(`${BEFORE_ANSWER_STAGE}`)
    expect($beforeQuestionStage.exists()).toBe(false)
  })
})
