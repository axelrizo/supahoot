import type { QuizService } from '@supahoot/services/quiz-service'
import { SupabaseQuizService } from '@supahoot/services/quiz-services/supabase-quiz-service'

export interface ServicesContainer {
  quizService: QuizService
}

export const container: ServicesContainer = {
  quizService: new SupabaseQuizService(),
}
