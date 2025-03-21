import type { PlayerProvider } from '@/lib/supahoot-web/providers/player-provider'
import { config } from '@vue/test-utils'
import { vi } from 'vitest'

const MockQuizService = vi.fn()
MockQuizService.prototype.getQuizzes = vi.fn()
MockQuizService.prototype.createLobby = vi.fn()
MockQuizService.prototype.getPlayersByLobby = vi.fn()
MockQuizService.prototype.startListeningForNewPlayers = vi.fn()
MockQuizService.prototype.stopListeningForNewPlayers = vi.fn()
MockQuizService.prototype.createPlayerByLobbyId = vi.fn()
MockQuizService.prototype.startQuiz = vi.fn()
MockQuizService.prototype.getQuizByLobbyId = vi.fn()

const MockAvatarService = vi.fn()
MockAvatarService.prototype.generateAvatarByString = vi.fn()

export const container = {
  quizService: new MockQuizService(),
  avatarService: new MockAvatarService(),
}

export const notificationProvider = {
  showNotification: vi.fn(),
}

export const playerProvider: PlayerProvider = {
  player: null,
}

config.global.provide = { container, notificationProvider, playerProvider }
