export interface AuthService {
  verifyToken(request: Request): Promise<boolean>;
}
