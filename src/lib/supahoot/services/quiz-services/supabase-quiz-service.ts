import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Lobby } from '@supahoot/quizzes/lobby'
import type { Quiz } from '@supahoot/quizzes/quiz'
import type { QuizService } from '@supahoot/services/quiz-service'
import { supabase } from '@supahoot/services/supabase-client'
import type { Player } from '../../quizzes/player'

export class SupabaseQuizService implements QuizService {
  private channels: Record<string, RealtimeChannel> = {}

  async getQuizzes() {
    const response = await supabase.from('quizzes').select('*')

    if (response.error) throw new Error(response.error.message)

    return response.data as Quiz[]
  }

  async createLobby(quizId: number) {
    const response = await supabase.from('lobbies').insert({ quiz_id: quizId }).select()

    if (response.error) throw new Error(response.error.message)

    return response.data[0] as Lobby
  }

  async getPlayersByLobby(_lobbyId: number): Promise<Player[]> {
    const response = await supabase.from('players').select('*')

    if (response.error) throw new Error(response.error.message)

    return response.data as Player[]
  }

  startListeningForNewPlayers(lobbyId: number, handleNewPlayer: (player: Player) => void) {
    if (!this.channels[`lobby-${lobbyId}`]) {
      this.channels[`lobby-${lobbyId}`] = supabase.channel(`lobby-${lobbyId}`)
    }

    this.channels[`lobby-${lobbyId}`]
      .on<Player>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'players',
          filter: `lobby_id=eq.${lobbyId}`,
        },
        (payload) => {
          handleNewPlayer(payload.new)
        },
      )
      .subscribe()
  }

  async stopListeningForNewPlayers(lobbyId: number) {
    if (!this.channels[`lobby-${lobbyId}`]) return

    try {
      const result = await this.channels[`lobby-${lobbyId}`].unsubscribe()
      if (result !== 'ok') throw new Error('Failed to unsubscribe')

      delete this.channels[`lobby-${lobbyId}`]
    } catch (_error) {
      throw new Error('Failed to unsubscribe')
    }
  }
}
