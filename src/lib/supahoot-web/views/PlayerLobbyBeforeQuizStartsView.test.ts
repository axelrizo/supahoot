import { container, playerProvider, } from '@/test/support/setup-container-mock'
import { testId } from '@/test/support/utils/html-utils'
import { mount, VueWrapper } from '@vue/test-utils'
import { getRouter } from 'vue-router-mock'
import PlayerLobbyBeforeQuizStartsView from './PlayerLobbyBeforeQuizStartsView.vue'
import { buildLobby, buildPlayer, buildQuiz } from '@/test/support/utils/factory-utils'
import { showsErrorNotification } from '@/test/support/utils/expect-utils'
import type { Player } from '@/lib/supahoot/quizzes/player'
import type { Lobby } from '@/lib/supahoot/quizzes/lobby'
import type { Quiz } from '@/lib/supahoot/quizzes/quiz'

describe('PlayerLobbyBeforeQuizStartsView', () => {
  describe('when has player stored in memory and player visits view', () => {
    test('shows player avatar stored in memory', async () => {
      const player = playerIsStoredInMemory()

      const { view } = await playerVisitsView()

      showsPlayerAvatar(view, player)
    })

    test('shows player username', async () => {
      const player = playerIsStoredInMemory()

      const { view } = await playerVisitsView()

      showsPlayerUsername(view, player)
    })
  })

  describe('when quiz starts', () => {
    test("redirects to player's quiz", async () => {
      quizStarts()

      const { view, quiz, lobby } = await playerVisitsView()

      rediretsToPlayerQuiz(view, lobby, quiz)
    })
  })

  describe('when player info is not provided', () => {
    test('shows error notification', async () => {
      playerIsNotStoredInMemory()

      await playerVisitsView()

      showsErrorNotification('Player not found')
    })

    test('redirects to home', async () => {
      playerIsNotStoredInMemory()

      const { view } = await playerVisitsView()

      redirectsToHome(view)
    })
  })

  /**
   * Simulates the player visiting the lobby before the quiz starts.
   */
  const playerVisitsView = async () => {
    const quiz = buildQuiz()
    const lobby = buildLobby()

    await getRouter().push({ params: { quizId: quiz.id, lobbyId: lobby.id } })
    const wrapper = mount(PlayerLobbyBeforeQuizStartsView)

    return { view: wrapper, quiz, lobby }
  }

  /**
   * Expects the player avatar to be shown in the view
   */
  const showsPlayerAvatar = (wrapper: VueWrapper, player: Player) => {
    const avatar = wrapper.get(testId('player-avatar'))

    expect(avatar.attributes('src')).toBe(player.image)
  }

  /**
   * Simulates the player having their info stored in memory   */
  const playerIsStoredInMemory = () => {
    const player = buildPlayer()
    playerProvider.player = player
    return player
  }

  /**
   * Simulates the player NOT having their info stored in memory
   */
  const playerIsNotStoredInMemory = () => {
    playerProvider.player = null
  }

  /**
   * Expects the player username to be shown in the view
   */
  const showsPlayerUsername = (wrapper: VueWrapper, player: Player) => {
    const username = wrapper.get(testId('player-username'))

    expect(username.text()).toBe(player.username)
  }

  /**
   * Mocks the quiz service to call the quiz start callback, simulating the quiz starting
   */
  const quizStarts = () => {
    container.quizService.listenQuizStart.mockImplementation(
      (_lobbyId: number, callback: () => void) => {
        callback()
      },
    )
  }

  /**
   * Expects the user to be redirected to home
   */
  const redirectsToHome = (view: VueWrapper) => {
    expect(view.router.push).toHaveBeenCalledWith(expect.objectContaining({ name: 'home' }))
  }

  /**
   * Expects the user to be redirected to player quiz
   */
  const rediretsToPlayerQuiz = (view: VueWrapper, lobby: Lobby, quiz: Quiz) => {
    const quizId = quiz.id
    const lobbyId = lobby.id

    expect(view.router.push).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: 'player-quiz', params: { quizId, lobbyId }, })
    )
  }
})

