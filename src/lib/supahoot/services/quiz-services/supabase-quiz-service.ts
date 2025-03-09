import type { QuizService } from '@supahoot/services/quiz-service'
import { supabase } from '../supabase-client'

export class SupabaseQuizService implements QuizService {
  async getQuizzes() {
    const response = await supabase.from('quizzes').select('*')

    if (response.error) throw new Error(response.error.message)

    return response.data
  }
  async createLobby(quizId: number) {
    const response = await supabase.from('lobbies').insert({ quiz_id: quizId }).select()

    if (response.error) throw new Error(response.error.message)

    return response.data
  }
}
