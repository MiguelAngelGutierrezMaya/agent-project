import { AuthService } from '@domain/services/Auth';

export class VerifyTokenUseCase {
  constructor(private readonly authService: AuthService) {}

  async execute(request: Request): Promise<boolean> {
    return this.authService.verifyToken(request);
  }
}
