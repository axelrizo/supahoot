import type { AuthService } from "../auth-service";

export class RealAuthService implements AuthService {
  verifyAdminSecretWord(secretWord: string) {
    return secretWord === import.meta.env.VITE_ADMIN_SECRET_WORD;
  }
}
