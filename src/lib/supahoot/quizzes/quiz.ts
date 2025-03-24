import type { QuestionWithAnswers } from '@supahoot/quizzes/question'

export interface Quiz {
  name: string
  id: number
}

export type QuizWithQuestionsWithAnswers = Quiz & {
  questions: QuestionWithAnswers[]
}
