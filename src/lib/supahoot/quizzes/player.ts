export interface Player {
  id: number
  username: string
  image: string
}

export type PlayerWithPoints = Player & { points: number }
