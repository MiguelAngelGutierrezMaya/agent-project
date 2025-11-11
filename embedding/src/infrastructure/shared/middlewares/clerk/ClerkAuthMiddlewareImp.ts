import { ClerkClient, createClerkClient } from '@clerk/backend';
import { AuthService } from '@src/domain/services/Auth';
import { DataNotDefinedError } from '@infrastructure/shared/utils/errors/services';
import { LoggerService } from '@src/domain/services/Logger';

import { createHash } from 'crypto';

interface AuthorizerValidation {
  execute: () => Promise<{ isAuthenticated: boolean }>;
}

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

  private hashPassword(password: string): string {
    return createHash('sha1').update(password).digest('hex');
  }

  private authorizeEventBridge(request: Request): AuthorizerValidation {
    return {
      execute: async () => {
        return {
          isAuthenticated:
            request.headers.get('Authorization') ===
            this.hashPassword(process.env.EVENT_BRIDGE_PASSWORD || ''),
        };
      },
    };
  }

  private authorizeApiGateway(request: Request): AuthorizerValidation {
    const authorizedParties: string[] = (
      process.env.CLERK_AUTHORIZED_PARTIES || ''
    ).split(',');

    return {
      execute: async () => {
        const { isAuthenticated } = await this.clerkClient.authenticateRequest(
          request,
          {
            jwtKey: process.env.CLERK_JWT_KEY || '',
            authorizedParties,
          }
        );
        return { isAuthenticated };
      },
    };
  }

  private authorize(request: Request): Promise<{ isAuthenticated: boolean }> {
    if (!request.method) {
      throw new DataNotDefinedError('Request body not defined');
    }

    const map: Record<string, (request: Request) => AuthorizerValidation> = {
      EVENT_BRIDGE: this.authorizeEventBridge,
      POST: this.authorizeApiGateway,
      GET: this.authorizeApiGateway,
      PUT: this.authorizeApiGateway,
      DELETE: this.authorizeApiGateway,
    };

    const func = map[request.method] || this.authorizeApiGateway;

    if (!func) {
      throw new DataNotDefinedError('Error authorizing request method');
    }

    return func.bind(this)(request).execute();
  }

  async verifyToken(request: Request): Promise<boolean> {
    const authorizedParties: string[] = (
      process.env.CLERK_AUTHORIZED_PARTIES || ''
    ).split(',');

    const { isAuthenticated } = await this.authorize(request);

    this.logger.info(
      `Token verified for request ${request.url} authorization: ${request.headers.get('Authorization')}, isAuthenticated: ${isAuthenticated}, authorizedParties: ${authorizedParties}, jwtKey: ${process.env.CLERK_JWT_KEY}`,
      ClerkAuthMiddlewareImp.name
    );

    return isAuthenticated;
  }
}
