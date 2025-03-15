import type { Lobby } from '@supahoot/quizzes/lobby'
import type { Quiz } from '@supahoot/quizzes/quiz'
import type { QuizService } from '@supahoot/services/quiz-service'
import { supabase } from '@supahoot/services/supabase-client'
import type { Player } from '../../quizzes/player'

export class SupabaseQuizService implements QuizService {
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
}
