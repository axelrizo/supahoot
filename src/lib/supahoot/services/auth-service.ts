export interface AuthService {
  verifyAdminSecretWord: (secretWord: string) => boolean
}
