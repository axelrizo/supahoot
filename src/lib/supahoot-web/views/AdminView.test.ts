import type { Quiz } from '@/lib/supahoot/quizzes/quiz'
import { quizHelpers } from '@/test/support/quiz-helpers'
import { container } from '@/test/support/setup-container-mock'
import { mount, type VueWrapper } from '@vue/test-utils'
import AdminView from './AdminView.vue'
import type { Lobby } from '@/lib/supahoot/quizzes/lobby'

let wrapper: VueWrapper

const quiz: Quiz = { id: 1, name: 'Quiz 1' }
const lobby: Lobby = { id: 1 }

describe('InitializeQuiz when quizzes provided', () => {
  beforeEach(() => {
    container.quizService.createLobby.mockResolvedValue(lobby)
    container.quizService.getQuizzes.mockResolvedValue([quiz])

    wrapper = mount(AdminView)
  })

  test('success: quizzes are printed', () => {
    expect(wrapper.find(quizHelpers.quizTitle).text()).toContain(quiz.name)
  })

  test('success: create a lobby when click on initialize quiz', async () => {
    await wrapper.find(quizHelpers.initializeQuizButton).trigger('click')

    expect(container.quizService.createLobby).toHaveBeenCalledWith(quiz.id)
  })

  test('success: redirect to admin lobby with room id when click on initialize quiz', async () => {
    await wrapper.find(quizHelpers.initializeQuizButton).trigger('click')

    expect(wrapper.vm.$route.path).toBe(`/admin/lobby/${quiz.id}`)
  })
})
