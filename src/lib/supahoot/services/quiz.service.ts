import type { Lobby } from '../quizzes/lobby'
import type { Player } from '../quizzes/player'
import type { Quiz } from '../quizzes/quiz'

export interface QuizService {
  getQuizzes(): Promise<Quiz[]>
  createLobby(quizId: number): Promise<Lobby>
  getPlayersByLobby(lobbyId: number): Promise<Player[]>
  startListeningForNewPlayers(lobbyId: number, handleNewPlayer: (player: Player) => void): void
  stopListeningForNewPlayers(lobbyId: number): Promise<void>
  createPlayerByLobbyId(lobbyId: number, username: string, avatar: File): Promise<Player>
  startQuiz(lobbyId: number): Promise<void>
  getQuizByLobbyId(lobbyId: number): Promise<Quiz>
}
