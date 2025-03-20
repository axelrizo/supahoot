import type { Player } from "@/lib/supahoot/quizzes/player"

export interface PlayerProvider {
  player: null | Player
}

export const playerProvider: PlayerProvider = {
  player: null,
}

