import type { PlayerProvider } from '@/lib/supahoot-web/providers/player-provider'
import type { AvatarService } from '@/lib/supahoot/services/avatar.service'
import type { QuizService } from '@/lib/supahoot/services/quiz.service'
import { config } from '@vue/test-utils'
import { vi } from 'vitest'

type MockService<TypeService> = Record<keyof TypeService, ReturnType<typeof vi.fn>>

const MockQuizService: MockService<QuizService> = {
  getQuizzes: vi.fn(),
  createLobby: vi.fn(),
  getPlayersByLobby: vi.fn(),
  startListeningForNewPlayers: vi.fn(),
  stopListeningForNewPlayers: vi.fn(),
  createPlayerByLobbyId: vi.fn(),
  startQuiz: vi.fn(),
  getQuizByLobbyId: vi.fn(),
  getQuestionByQuizIdAndQuestionOrder: vi.fn(),
  updateCountdownBeforeAnswer: vi.fn(),
  listenCountdownBeforeQuestionStart: vi.fn(),
  updateAnsweringCountdown: vi.fn(),
  listenStartAnswerQuestionCountdown: vi.fn(),
  listenQuizStart: vi.fn(),
  listenQuestion: vi.fn(),
  sendAnswer: vi.fn(),
  listenPlayerQuestionPoints: vi.fn(),
  sendQuestion: vi.fn(),
  getQuizWithQuestionsAndAnswersByQuizId: vi.fn(),
}

const MockAvatarService: MockService<AvatarService> = {
  generateAvatarByString: vi.fn(),
}

export const container = {
  quizService: MockQuizService,
  avatarService: MockAvatarService,
}

export const notificationProvider = {
  showNotification: vi.fn(),
}

export const playerProvider: PlayerProvider = {
  player: null,
}

config.global.provide = { container, notificationProvider, playerProvider }
