import { config } from '@vue/test-utils'
import { vi } from 'vitest'

const MockLobbyService = vi.fn()
MockLobbyService.prototype.create = vi.fn()

export const container = {
  lobbyService: new MockLobbyService(),
}

export const notificationProvider = {
  showNotification: vi.fn(),
}

config.global.provide = { container, notificationProvider }
