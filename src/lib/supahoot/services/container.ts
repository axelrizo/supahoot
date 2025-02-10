import type { LobbyService } from './lobby-service'
import { SupabaseLobbyService } from './lobby-service/supabase-lobby-service'

export interface ServicesContainer {
  lobbyService: LobbyService
}

export const container: ServicesContainer = {
  lobbyService: new SupabaseLobbyService(),
}
