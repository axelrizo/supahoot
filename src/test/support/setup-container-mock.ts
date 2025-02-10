import { config } from '@vue/test-utils'
import { vi } from 'vitest'

const MockLobbyService = vi.fn()
MockLobbyService.prototype.create = vi.fn()

export const container = {
  lobbyService: new MockLobbyService(),
}

config.global.provide = { container }
