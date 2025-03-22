import type { QuizService } from '@/lib/supahoot/services/quiz.service'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'
import type { Lobby } from '@supahoot/quizzes/lobby'
import type { Player } from '@supahoot/quizzes/player'
import type { Quiz } from '@supahoot/quizzes/quiz'
import { type Database } from '../../../../../database.types'
import type { PlayerAnswer } from '../../quizzes/player-answer'
import type { Question } from '../../quizzes/question'

type Handler<TypePayload> = (payload: TypePayload) => void

interface EventListeners {
  listenForNewPlayers: Handler<Player>[]
  startQuiz: Handler<void>[]
  updateCountdownBeforeQuestionStart: Handler<number>[]
  listenQuestion: Handler<Question>[]
  listenPlayerQuestionPoints: { playerId: number; callback: Handler<PlayerAnswer> }[]
}

export class SupabaseQuizService implements QuizService {
  private supabase = createClient<Database>(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_KEY,
  )

  private channels: Record<string, RealtimeChannel> = {}

  private eventListeners: EventListeners = {
    listenForNewPlayers: [],
    startQuiz: [],
    updateCountdownBeforeQuestionStart: [],
    listenQuestion: [],
    listenPlayerQuestionPoints: [],
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
    this.initializeLobbyChannel(lobbyId)

    this.eventListeners.listenForNewPlayers.push(handleNewPlayer)
  }

  async stopListeningForNewPlayers(lobbyId: number) {
    this.initializeLobbyChannel(lobbyId)

    this.eventListeners.listenForNewPlayers = []
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
    const channel = this.initializeLobbyChannel(lobbyId)

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

  updateCountdownBeforeQuestionStart(lobbyId: number, count: number): void {
    const channel = this.initializeLobbyChannel(lobbyId)

    channel.send({
      type: 'broadcast',
      event: 'update_countdown_before_question_start',
      payload: { count },
    })
  }

  updateStartAnswerQuestionCountdown(lobbyId: number, count: number): void {
    const channel = this.initializeLobbyChannel(lobbyId)

    channel.send({
      type: 'broadcast',
      event: 'update_start_answer_question_countdown',
      payload: { count },
    })
  }

  listenQuizStart(lobbyId: number, callback: () => void): void {
    this.initializeLobbyChannel(lobbyId)

    this.eventListeners.startQuiz.push(callback)
  }

  listenQuestion(lobbyId: number, callback: (question: Question) => void): void {
    this.initializeLobbyChannel(lobbyId)

    this.eventListeners.listenQuestion.push(callback)
  }

  sendAnswer(lobbyId: number, playerId: number, answerId: number) {
    const channel = this.initializeLobbyChannel(lobbyId)

    channel.send({
      type: 'broadcast',
      event: 'send_answer',
      payload: { answer_id: answerId, player_id: playerId },
    })
  }

  listenPlayerQuestionPoints(
    lobbyId: number,
    playerId: number,
    callback: (points: PlayerAnswer) => void,
  ): void {
    this.initializeLobbyChannel(lobbyId)

    this.eventListeners.listenPlayerQuestionPoints.push({ playerId, callback })
  }

  private initializeLobbyChannel(lobbyId: number) {
    if (this.channels[`lobby-${lobbyId}`]) {
      return this.channels[`lobby-${lobbyId}`]
    }

    const channel = this.supabase
      .channel(`lobby-${lobbyId}`)
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
          this.eventListeners.listenForNewPlayers.forEach((listener) => {
            listener(player)
          })
        },
      )
      .on<PlayerAnswer>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'player_answers',
        },
        (payload) => {
          this.eventListeners.listenPlayerQuestionPoints.forEach(({ playerId, callback }) => {
            if (payload.new.playerId !== playerId) return
            callback(payload.new)
          })
        },
      )
      .on('broadcast', { event: 'start_quiz' }, (_payload) => {
        this.eventListeners.startQuiz.forEach((listener: () => void) => {
          listener()
        })
      })
      .on<{ count: number }>(
        'broadcast',
        { event: 'update_countdown_before_question_start' },
        (payload) => {
          this.eventListeners.updateCountdownBeforeQuestionStart.forEach((listener) => {
            listener(payload.payload.count)
          })
        },
      )
      .subscribe()

    this.channels[`lobby-${lobbyId}`] = channel
    return channel
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
