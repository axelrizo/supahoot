import type { NotificationProvider } from '@/lib/supahoot-web/providers/notification-provider'
import type { PlayerProvider } from '@/lib/supahoot-web/providers/player-provider'
import type { AvatarService } from '@/lib/supahoot/services/avatar.service'
import type { ServicesContainer } from '@/lib/supahoot/services/container'
import type { QuizService } from '@/lib/supahoot/services/quiz.service'
import { config } from '@vue/test-utils'
import { vi } from 'vitest'

const MockQuizService: QuizService = {
  getQuizzes: vi.fn(),
  createLobby: vi.fn(),
  getPlayersByLobby: vi.fn(),
  startListeningForNewPlayers: vi.fn(),
  stopListeningForNewPlayers: vi.fn(),
  createPlayerByLobbyId: vi.fn(),
  startQuiz: vi.fn(),
  getQuizByLobbyId: vi.fn(),
  updateCountdownBeforeAnswer: vi.fn(),
  updateAnsweringCountdown: vi.fn(),
  listenQuizStart: vi.fn(),
  listenQuestion: vi.fn(),
  sendAnswer: vi.fn(),
  listenPlayerQuestionPoints: vi.fn(),
  sendQuestion: vi.fn(),
  getQuizWithQuestionsAndAnswersByQuizId: vi.fn(),
  getPlayerCountPerAnswerInQuestionByLobbyIdAndQuestionId: vi.fn(),
  listenUpdateAnsweringCountdown: vi.fn(),
  listenUpdateCountdownBeforeAnswer: vi.fn(),
  getAwardsDashboard: vi.fn(),
}

const MockAvatarService: AvatarService = {
  generateAvatarByString: vi.fn(),
}

export const container: ServicesContainer = {
  quizService: MockQuizService,
  avatarService: MockAvatarService,
}

export const notificationProvider: NotificationProvider = {
  showNotification: vi.fn(),
}

export const playerProvider: PlayerProvider = {
  player: null,
}

config.global.provide = { container, notificationProvider, playerProvider }
