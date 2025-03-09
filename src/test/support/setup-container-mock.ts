import { config } from '@vue/test-utils'
import { vi } from 'vitest'

const MockLobbyService = vi.fn()
MockLobbyService.prototype.create = vi.fn()

const MockAuthService = vi.fn()
MockAuthService.prototype.verifyAdminSecretWord = vi.fn()

export const container = {
  lobbyService: new MockLobbyService(),
  authService: new MockAuthService(),
}

export const notificationProvider = {
  showNotification: vi.fn(),
}

config.global.provide = { container, notificationProvider }
