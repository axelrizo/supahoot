import type { QuizService } from '@/lib/supahoot/services/quiz.service'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'
import type { Lobby } from '@supahoot/quizzes/lobby'
import type { Player, PlayerWithPoints } from '@supahoot/quizzes/player'
import type { Quiz, QuizWithQuestionsWithAnswers } from '@supahoot/quizzes/quiz'
import { type Database } from '../../../../../database.types'
import type { PlayerAnswer } from '../../quizzes/player-answer'
import type { QuestionWithAnswers } from '../../quizzes/question'

type Handler<TypePayload> = (payload: TypePayload) => void

interface EventListeners {
  listenForNewPlayers: Handler<Player>[]
  startQuiz: Handler<void>[]
  updateCountdownBeforeAnswer: Handler<number>[]
  updateAnsweringCountdown: Handler<number>[]
  listenQuestion: Handler<QuestionWithAnswers>[]
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
    updateCountdownBeforeAnswer: [],
    updateAnsweringCountdown: [],
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

  listenQuizStart(lobbyId: number, callback: () => void): void {
    this.initializeLobbyChannel(lobbyId)
    this.eventListeners.startQuiz.push(callback)
  }

  listenQuestion(lobbyId: number, callback: (question: QuestionWithAnswers) => void): void {
    this.initializeLobbyChannel(lobbyId)
    this.eventListeners.listenQuestion.push(callback)
  }

  async sendAnswer(lobbyId: number, playerId: number, questionId: number, answerId: number) {
    const { error, data } = await this.supabase.rpc('register_answer', {
      lobby_id_input: lobbyId,
      player_id_input: playerId,
      question_id_input: questionId,
      answer_id_input: answerId,
    })

    if (error) throw new Error(error.message)

    if (data.length === 0) return null

    return data.map(({ answer_id, created_at, id, player_id, points }) => {
      return {
        answerId: answer_id,
        createdAt: created_at,
        id,
        playerId: player_id,
        points,
      }
    })[0] as PlayerAnswer
  }

  listenPlayerQuestionPoints(
    lobbyId: number,
    playerId: number,
    callback: (points: PlayerAnswer) => void,
  ): void {
    this.initializeLobbyChannel(lobbyId)
    this.eventListeners.listenPlayerQuestionPoints.push({ playerId, callback })
  }

  updateCountdownBeforeAnswer(lobbyId: number, count: number): void {
    this.initializeLobbyChannel(lobbyId).send({
      type: 'broadcast',
      event: 'update_countdown_before_answer',
      payload: { count },
    })
  }

  listenUpdateCountdownBeforeAnswer(lobbyId: number, callback: (count: number) => void): void {
    this.initializeLobbyChannel(lobbyId)
    this.eventListeners.updateCountdownBeforeAnswer.push(callback)
  }

  updateAnsweringCountdown(lobbyId: number, count: number): void {
    this.initializeLobbyChannel(lobbyId).send({
      type: 'broadcast',
      event: 'update_answering_countdown',
      payload: { count },
    })
  }

  listenUpdateAnsweringCountdown(lobbyId: number, callback: (count: number) => void): void {
    this.initializeLobbyChannel(lobbyId)
    this.eventListeners.updateAnsweringCountdown.push(callback)
  }

  sendQuestion(lobbyId: number, question: QuestionWithAnswers): void {
    this.initializeLobbyChannel(lobbyId).send({
      type: 'broadcast',
      event: 'send_question',
      payload: question,
    })
  }

  async getQuizWithQuestionsAndAnswersByQuizId(
    quizId: number,
  ): Promise<QuizWithQuestionsWithAnswers> {
    const { data, error } = await this.supabase
      .from('quizzes')
      .select(
        `
        *,
        questions (
          *,
          answers (*, isCorrect:is_correct)
        )
      `,
      )
      .eq('id', quizId)

    if (error) throw new Error(error.message)

    return data[0] as QuizWithQuestionsWithAnswers
  }

  async getPlayerCountPerAnswerInQuestionByLobbyIdAndQuestionId(
    lobbyId: number,
    questionId: number,
  ) {
    const { data, error } = await this.supabase.rpc('get_answer_counts', {
      lobby_id_input: lobbyId,
      question_id_input: questionId,
    })

    if (error) throw new Error(error.message)

    return data.map(({ answer_id, player_count }) => {
      return { answerId: answer_id, playerCount: player_count }
    })
  }

  async getAwardsDashboard(lobbyId: number): Promise<PlayerWithPoints[]> {
    const { data, error } = await this.supabase.rpc('get_awards', { lobby_id_input: lobbyId })

    if (error) throw new Error(error.message)

    return data.map((player) => {
      return { ...player, points: player.total_points }
    })
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
          table: 'players_answers',
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
        { event: 'update_countdown_before_answer' },
        (payload) => {
          this.eventListeners.updateCountdownBeforeAnswer.forEach((listener) => {
            listener(payload.payload.count)
          })
        },
      )
      .on<{ count: number }>('broadcast', { event: 'update_answering_countdown' }, (payload) => {
        this.eventListeners.updateAnsweringCountdown.forEach((listener) => {
          listener(payload.payload.count)
        })
      })
      .on('broadcast', { event: 'send_question' }, (payload) => {
        this.eventListeners.listenQuestion.forEach((listener) => {
          listener(payload.payload)
        })
      })
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
