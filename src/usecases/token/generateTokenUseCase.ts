import { AppError } from '../../errors/appError';
import { Result, Ok } from '../../errors/result';
import { User } from '../../entities/user/user';
import { TokenProvider } from '../../providers/tokenProvider';
import { TokenClaims } from '../../entities/auth/tokenClaims';

export class GenerateTokenUseCase {
  constructor(private readonly tokenProvider: TokenProvider) {}

  async execute(user: User): Promise<Result<string, AppError>> {
    const now = Date.now();
    const claims: TokenClaims = {
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
      issuedAt: now,
      expiresAt: now + 5 * 60 * 1000,
    };

    const token = await this.tokenProvider.generate(claims);
    return Ok.of(token);
  }
}
