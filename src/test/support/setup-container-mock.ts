import type { ServicesContainer } from '@/lib/supahoot/services/container'
import { config } from '@vue/test-utils'
import { vi } from 'vitest'

const MockLobbyService = vi.fn()
MockLobbyService.prototype.create = vi.fn()

export const container: ServicesContainer = {
  lobbyService: new MockLobbyService(),
}

config.global.provide = { container }
