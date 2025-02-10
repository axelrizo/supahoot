import type { LobbyService } from '../lobby-service'
import { supabase } from '@supahoot/services/supabase-client'

export class SupabaseLobbyService implements LobbyService {
  async create({ name }: { name: string }) {
    const response = await supabase.from('lobbies').insert({ name })
    if (response.error) throw new Error(response.error.message)
  }
}
