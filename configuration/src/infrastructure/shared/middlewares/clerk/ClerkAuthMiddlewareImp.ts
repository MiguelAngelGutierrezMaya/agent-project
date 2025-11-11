import { ClerkClient, createClerkClient } from '@clerk/backend';
import { AuthService } from '@src/domain/services/Auth';
import { DataNotDefinedError } from '@infrastructure/shared/utils/errors/services';
import { LoggerService } from '@src/domain/services/Logger';

export class ClerkAuthMiddlewareImp implements AuthService {
  private readonly clerkClient: ClerkClient;

  constructor(private readonly logger: LoggerService) {
    if (!process.env.CLERK_SECRET_KEY || !process.env.CLERK_PUBLISHABLE_KEY) {
      throw new DataNotDefinedError(
        'Auth keys not defined',
        'ClerkAuthMiddlewareImp'
      );
    }

    if (!process.env.CLERK_AUTHORIZED_PARTIES || !process.env.CLERK_JWT_KEY) {
      throw new DataNotDefinedError(
        'Config keys not defined',
        'ClerkAuthMiddlewareImp'
      );
    }

    this.clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY || '',
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY || '',
    });
  }

  async verifyToken(request: Request): Promise<boolean> {
    const authorizedParties: string[] = (
      process.env.CLERK_AUTHORIZED_PARTIES || ''
    ).split(',');

    const { isAuthenticated } = await this.clerkClient.authenticateRequest(
      request,
      {
        jwtKey: process.env.CLERK_JWT_KEY || '',
        authorizedParties,
      }
    );

    this.logger.info(
      `Token verified for request ${request.url} authorization: ${request.headers.get('Authorization')}, isAuthenticated: ${isAuthenticated}, authorizedParties: ${authorizedParties}, jwtKey: ${process.env.CLERK_JWT_KEY}`,
      ClerkAuthMiddlewareImp.name
    );

    return isAuthenticated;
  }
}
