import type { QuizService } from '@/lib/supahoot/services/quiz.service'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'
import type { Lobby } from '@supahoot/quizzes/lobby'
import type { Player } from '@supahoot/quizzes/player'
import type { Quiz } from '@supahoot/quizzes/quiz'
import { type Database } from '../../../../../database.types'
import type { Question } from '../../quizzes/question'

type Handler<TypePayload> = (payload: TypePayload) => void

interface EventListeners {
  listen_for_new_players: Handler<Player>[]
  start_quiz: Handler<void>[]
  listen_question_countdown: Handler<number>[]
}

export class SupabaseQuizService implements QuizService {
  private supabase = createClient<Database>(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_KEY,
  )

  private channels: Record<string, RealtimeChannel> = {}

  private eventListeners: EventListeners = {
    listen_for_new_players: [],
    start_quiz: [],
    listen_question_countdown: [],
  }

  async getQuizzes() {
    const { error, data } = await this.supabase.from('quizzes').select('*')

    if (error) throw new Error(error.message)

    return data as Quiz[]
  }

  async createLobby(quizId: number) {
    const { error, data } = await this.supabase.from('lobbies').insert({ quiz_id: quizId }).select()

    if (error) throw new Error(error.message)

    return data[0] as Lobby
  }

  async getPlayersByLobby(lobbyId: number): Promise<Player[]> {
    const { error, data } = await this.supabase.from('players').select('*').eq('lobby_id', lobbyId)

    const players = data!.map(this.generatePlayerWithAvatar.bind(this))

    if (error) throw new Error(error.message)

    return players as Player[]
  }

  startListeningForNewPlayers(lobbyId: number, handleNewPlayer: (player: Player) => void) {
    this.startLobbyChannel(lobbyId)

    this.eventListeners.listen_for_new_players.push(handleNewPlayer)
  }

  async stopListeningForNewPlayers(lobbyId: number) {
    this.startLobbyChannel(lobbyId)

    this.eventListeners.listen_for_new_players = []
  }

  async createPlayerByLobbyId(lobbyId: number, username: string, file: File): Promise<Player> {
    const { error: avatar_error, data: avatar_data } = await this.supabase.storage
      .from('player-avatars')
      .upload(`public/${lobbyId}_${username}.jpeg`, file)

    if (avatar_error) throw new Error(avatar_error.message)

    const { error, data } = await this.supabase
      .from('players')
      .insert({ lobby_id: lobbyId, username, image: avatar_data.path })
      .select()

    if (error) throw new Error(error.message)

    return this.generatePlayerWithAvatar(data[0]) as Player
  }

  async startQuiz(lobbyId: number) {
    const channel = this.startLobbyChannel(lobbyId)

    const response = await channel.send({
      type: 'broadcast',
      event: 'start_quiz',
    })

    if (response !== 'ok') {
      throw new Error('Failed to start quiz')
    }
  }

  async getQuizByLobbyId(lobbyId: number): Promise<Quiz> {
    const { error, data } = await this.supabase
      .from('lobbies')
      .select('quizzes(*)')
      .eq('id', lobbyId)

    if (error) throw new Error(error.message)

    return data[0].quizzes as Quiz
  }

  async getQuestionByQuizIdAndQuestionOrder(
    quizId: number,
    questionOrder: number,
  ): Promise<Question> {
    const { error, data } = await this.supabase
      .from('questions')
      .select('*, answers(*)')
      .eq('"order"', questionOrder)
      .eq('quiz_id', quizId)

    if (error) throw new Error(error.message)

    return data[0] as Question
  }

  listenCountdown(lobbyId: number, callback: (count: number) => void): void {
    this.startLobbyChannel(lobbyId)

    this.eventListeners.listen_question_countdown.push(callback)
  }

  updateCountdown(lobbyId: number, count: number): void {
    const channel = this.startLobbyChannel(lobbyId)

    channel.send({
      type: 'broadcast',
      event: 'update_countdown',
      payload: { count },
    })
  }

  listenQuizStart(lobbyId: number, callback: () => void): void {
    this.startLobbyChannel(lobbyId)

    this.eventListeners.start_quiz.push(callback)
  }

  private startLobbyChannel(lobbyId: number) {
    if (!this.channels[`lobby-${lobbyId}`]) {
      this.channels[`lobby-${lobbyId}`] = this.supabase.channel(`lobby-${lobbyId}`)
    }

    return this.channels[`lobby-${lobbyId}`]
      .on<Player>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'players',
          filter: `lobby_id=eq.${lobbyId}`,
        },
        (payload) => {
          const player = {
            ...payload.new,
            image: this.getPlayerAvatarUrl(payload.new),
          }
          this.eventListeners.listen_for_new_players.forEach((listener) => {
            listener(player)
          })
        },
      )
      .subscribe()
  }

  private generatePlayerWithAvatar(player: Player) {
    return {
      ...player,
      image: this.getPlayerAvatarUrl(player),
    }
  }

  private getPlayerAvatarUrl(player: Player) {
    const {
      data: { publicUrl },
    } = this.supabase.storage.from('player-avatars').getPublicUrl(player.image)

    return publicUrl
  }
}
