import type { Player } from "@/lib/supahoot/quizzes/player"

/**
 * Player factory
 * @param replaceAttrs - Optional attributes to override the default player values
 */
export const createPlayer = (replaceAttrs?: Partial<Player>): Player => {
  const player = { id: 100, username: 'any-player-name', image: '/any-avatar-path' }
  if (replaceAttrs) return { ...player, ...replaceAttrs }
  return player
}
