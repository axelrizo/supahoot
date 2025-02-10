export interface LobbyService {
  create: ({ name }: { name: string }) => Promise<void>
}
