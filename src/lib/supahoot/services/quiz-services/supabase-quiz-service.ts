import { botttsNeutral } from '@dicebear/collection'
import { toJpeg } from '@dicebear/converter'
import { createAvatar } from '@dicebear/core'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Lobby } from '@supahoot/quizzes/lobby'
import type { Quiz } from '@supahoot/quizzes/quiz'
import type { QuizService } from '@supahoot/services/quiz-service'
import { supabase } from '@supahoot/services/supabase-client'
import type { Player } from '../../quizzes/player'

export class SupabaseQuizService implements QuizService {
  private channels: Record<string, RealtimeChannel> = {}

  async getQuizzes() {
    const { error, data } = await supabase.from('quizzes').select('*')

    if (error) throw new Error(error.message)

    return data as Quiz[]
  }

  async createLobby(quizId: number) {
    const { error, data } = await supabase.from('lobbies').insert({ quiz_id: quizId }).select()

    if (error) throw new Error(error.message)

    return data[0] as Lobby
  }

  async getPlayersByLobby(_lobbyId: number): Promise<Player[]> {
    const { error, data } = await supabase.from('players').select('*')

    if (error) throw new Error(error.message)

    return data as Player[]
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

  async generatePlayerAvatar(userName: string) {
    const avatar = createAvatar(botttsNeutral, { seed: userName })
    const buffer = await toJpeg(avatar).toArrayBuffer()
    const uint8Array = new Uint8Array(buffer)
    return new File([uint8Array], `${userName}.jpeg`, { type: 'image/jpeg' })
  }

  createPlayerByLobbyId(_lobbyId: number, _username: string): Promise<Player> {
    throw new Error('Method not implemented.')
  }
}
