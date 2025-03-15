import type { Lobby } from '../quizzes/lobby'
import type { Player } from '../quizzes/player'
import type { Quiz } from '../quizzes/quiz'

export interface QuizService {
  getQuizzes(): Promise<Quiz[]>
  createLobby(quizId: number): Promise<Lobby>
  getPlayersByLobby(lobbyId: number): Promise<Player[]>
}
