import { config } from '@vue/test-utils'
import { vi } from 'vitest'

const MockQuizService = vi.fn()
MockQuizService.prototype.getQuizzes = vi.fn()
MockQuizService.prototype.createLobby = vi.fn()
MockQuizService.prototype.getPlayersByLobby = vi.fn()
MockQuizService.prototype.startListeningNewPlayers = vi.fn()
MockQuizService.prototype.stopListeningNewPlayers = vi.fn()

export const container = {
  quizService: new MockQuizService(),
}

export const notificationProvider = {
  showNotification: vi.fn(),
}

config.global.provide = { container, notificationProvider }
