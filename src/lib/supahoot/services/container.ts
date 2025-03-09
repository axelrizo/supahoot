import type { AuthService } from './auth-service'
import { RealAuthService } from './auth-services/real-auth-service'
import type { LobbyService } from './lobby-service'
import { SupabaseLobbyService } from './lobby-services/supabase-lobby-service'

export interface ServicesContainer {
  lobbyService: LobbyService
  authService: AuthService
}

export const container: ServicesContainer = {
  lobbyService: new SupabaseLobbyService(),
  authService: new RealAuthService(),
}
