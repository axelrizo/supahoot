import type { LobbyService } from '@supahoot/services/lobby-service'
import { SupabaseLobbyService } from '@supahoot/services/lobby-services/supabase-lobby-service'
import type { QuizService } from '@supahoot/services/quiz-service'
import { SupabaseQuizService } from '@supahoot/services/quiz-services/supabase-quiz-service'

export interface ServicesContainer {
  lobbyService: LobbyService
  quizService: QuizService
}

export const container: ServicesContainer = {
  lobbyService: new SupabaseLobbyService(),
  quizService: new SupabaseQuizService(),
}
