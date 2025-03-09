import { quizHelpers } from "@/test/support/quiz-helpers"
import { container } from "@/test/support/setup-container-mock"
import { mount, type VueWrapper } from "@vue/test-utils"
import AdminView from "./AdminView.vue"

let wrapper: VueWrapper

describe("InitializeQuiz", () => {
  beforeEach(() => {
    wrapper = mount(AdminView)
  })

  test.only("success: quizzes are printed", () => {
    container.quizService.getQuizzes.mockResolvedValue([
      { id: 1, name: "Quiz 1" }
    ])

    expect(wrapper.find(quizHelpers.quizTitle).text()).toContain("Quiz 1")
  })
})
