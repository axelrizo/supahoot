import type { Answer } from './answer'

export interface Question {
  id: number
  title: string
  order: number
  image: string
}

export type QuestionWithAnswers = Question & {
  answers: Answer[]
}
