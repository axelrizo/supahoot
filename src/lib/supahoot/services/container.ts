import { SupabaseQuizService } from '@/lib/supahoot/services/quiz-services/supabase-quiz.service'
import type { QuizService } from '@/lib/supahoot/services/quiz.service'
import { DicebearAvatarService } from './avatar-services/dicebear-avatar.service'
import type { AvatarService } from './avatar.service'

export interface ServicesContainer {
  quizService: QuizService
  avatarService: AvatarService
}

export const container: ServicesContainer = {
  quizService: new SupabaseQuizService(),
  avatarService: new DicebearAvatarService(),
}
