import { TokenClaims } from '../../entities/auth/tokenClaims';
import { Ok, Err, Result } from '../../errors/result';
import { TokenProvider } from '../../providers/tokenProvider';
import { NotFoundError } from '../../errors/errors';
import { AppError } from '../../errors/appError';

export function tokenProviderStub(): TokenProvider {
  return {
    async generate(): Promise<Result<string, AppError>> {
      return Ok.of('fake.token.here');
    },

    async verify(token: string) {
      if (!token) {
        return Err.of(new NotFoundError('Token introuvable'));
      }

      const now = new Date().getTime(); // millisecondes
      const claims: TokenClaims = {
        userId: 1,
        email: 'test@example.com',
        roleId: 2,
        issuedAt: now,
        expiresAt: now + 5 * 60 * 1000, // 5 minutes
      };
      return Ok.of(claims);
    },
  };
}
