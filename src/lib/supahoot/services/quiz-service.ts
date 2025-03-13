import type { Lobby } from '../quizzes/lobby'
import type { Quiz } from '../quizzes/quiz'

export interface QuizService {
  getQuizzes(): Promise<Quiz[]>
  createLobby(quizId: number): Promise<Lobby>
}
