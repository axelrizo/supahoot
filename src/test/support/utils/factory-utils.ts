import type { Player } from "@/lib/supahoot/quizzes/player"
import type { Quiz } from "@/lib/supahoot/quizzes/quiz"
import type { Lobby } from "@/lib/supahoot/quizzes/lobby"

/**
 * Quiz factory
 * @param overrides - Optional attributes to override the default quiz values
 */
export const buildQuiz = (overrides?: Partial<Quiz>): Quiz => ({
  id: 1234,
  name: 'Any Quiz Name',
  ...overrides
})

/**
 * Lobby factory
 * @param overrides - Optional attributes to override the default lobby values
 */
export const buildLobby = (overrides?: Partial<Lobby>): Lobby => ({
  id: 123,
  ...overrides
})

/**
 * Player factory
 * @param overrides - Optional attributes to override the default player values
 */
export const buildPlayer = (overrides?: Partial<Player>): Player => ({
  id: 100,
  username: 'any-player-name',
  image: '/any-avatar-path',
  ...overrides
})
