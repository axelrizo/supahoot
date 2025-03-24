import type { Lobby } from '@supahoot/quizzes/lobby'
import type { Player } from '@supahoot/quizzes/player'
import type { Question } from '@supahoot/quizzes/question'
import type { Quiz, QuizWithQuestionsWithAnswers } from '@supahoot/quizzes/quiz'
import type { PlayerAnswer } from '../quizzes/player-answer'

export interface QuizService {
  /**
   * Get all quizzes
   */
  getQuizzes(): Promise<Quiz[]>
  /**
   * Create a lobby for a quiz
   */
  createLobby(quizId: number): Promise<Lobby>
  /**
   * Get all players in a lobby
   */
  getPlayersByLobby(lobbyId: number): Promise<Player[]>
  /**
   * Start listening for new players in a lobby
   */
  startListeningForNewPlayers(lobbyId: number, handleNewPlayer: (player: Player) => void): void
  /**
   * Stop listening for new players in a lobby
   */
  stopListeningForNewPlayers(lobbyId: number): Promise<void>
  /**
   * Create a player in a lobby
   */
  createPlayerByLobbyId(lobbyId: number, username: string, avatar: File): Promise<Player>
  /**
   * Send the signal to start the quiz
   */
  startQuiz(lobbyId: number): Promise<void>
  /**
   * Get the quiz by the lobby id
   */
  getQuizByLobbyId(lobbyId: number): Promise<Quiz>
  /**
   * Get the question by the quiz id and the question order
   */
  getQuestionByQuizIdAndQuestionOrder(quizId: number, questionOrder: number): Promise<Question>
  /**
   * Update the countdown before the question start
   */
  updateCountdownBeforeQuestionStart(lobbyId: number, count: number): void
  /**
   * Listen countdown before the question start
   */
  listenCountdownBeforeQuestionStart(lobbyId: number, callback: (count: number) => void): void
  /**
   * Update the countdown to start answering the question
   */
  updateStartAnswerQuestionCountdown(lobbyId: number, count: number): void
  /**
   * Listen countdown to start answering the question
   */
  listenStartAnswerQuestionCountdown(lobbyId: number, callback: (count: number) => void): void
  /**
   * Listen to the quiz start
   */
  listenQuizStart(lobbyId: number, callback: () => void): void
  /**
   * Listen to the question
   */
  listenQuestion(lobbyId: number, callback: (question: Question) => void): void
  /**
   * Send the player answer
   */
  sendAnswer(lobbyId: number, playerId: number, answerId: number): void
  /**
   * Listen to the player question points
   */
  listenPlayerQuestionPoints(
    lobbyId: number,
    playerId: number,
    callback: (points: PlayerAnswer) => void,
  ): void
  /**
   * Send the question to the players
   */
  sendQuestion(lobbyId: number, question: Question): void
  /**
   * Get quiz details by the quiz id
   */
  getQuizWithQuestionsAndAnswersByQuizId(quizId: number): Promise<QuizWithQuestionsWithAnswers>
}
