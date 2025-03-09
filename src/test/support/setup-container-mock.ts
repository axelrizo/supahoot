import { config } from '@vue/test-utils'
import { vi } from 'vitest'

const MockLobbyService = vi.fn()
MockLobbyService.prototype.create = vi.fn()

const MockQuizService = vi.fn()
MockQuizService.prototype.getQuizzes = vi.fn()

export const container = {
  lobbyService: new MockLobbyService(),
  quizService: new MockQuizService(),
}

export const notificationProvider = {
  showNotification: vi.fn(),
}

config.global.provide = { container, notificationProvider }
