import type { Lobby } from '@supahoot/quizzes/lobby'
import type { Player } from '@supahoot/quizzes/player'
import type { Question } from '@supahoot/quizzes/question'
import type { Quiz } from '@supahoot/quizzes/quiz'

export interface QuizService {
  getQuizzes(): Promise<Quiz[]>
  createLobby(quizId: number): Promise<Lobby>
  getPlayersByLobby(lobbyId: number): Promise<Player[]>
  startListeningForNewPlayers(lobbyId: number, handleNewPlayer: (player: Player) => void): void
  stopListeningForNewPlayers(lobbyId: number): Promise<void>
  createPlayerByLobbyId(lobbyId: number, username: string, avatar: File): Promise<Player>
  startQuiz(lobbyId: number): Promise<void>
  getQuizByLobbyId(lobbyId: number): Promise<Quiz>
  getQuestionByQuizIdAndQuestionOrder(quizId: number, questionOrder: number): Promise<Question>
  listenCountdown(lobbyId: number, callback: (count: number) => void): void
  updateCountdown(lobbyId: number, count: number): void
  listenQuizStart(lobbyId: number, callback: () => void): void
}
