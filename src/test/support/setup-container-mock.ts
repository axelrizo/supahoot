import { config } from '@vue/test-utils'
import { vi } from 'vitest'

const MockQuizService = vi.fn()
MockQuizService.prototype.getQuizzes = vi.fn()
MockQuizService.prototype.createLobby = vi.fn()
MockQuizService.prototype.getPlayersByLobby = vi.fn()
MockQuizService.prototype.startListeningForNewPlayers = vi.fn()
MockQuizService.prototype.stopListeningForNewPlayers = vi.fn()
MockQuizService.prototype.createPlayerByLobbyId = vi.fn()
MockQuizService.prototype.generatePlayerAvatar = vi.fn()

export const container = {
  quizService: new MockQuizService(),
}

export const notificationProvider = {
  showNotification: vi.fn(),
}

config.global.provide = { container, notificationProvider }
