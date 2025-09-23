import { AppError } from '../../errors/appError';
import { Result } from '../../errors/result';
import { TokenClaims } from '../../entities/auth/tokenClaims';
import { TokenProvider } from '../../providers/tokenProvider';

export class VerifyTokenUseCase {
  constructor(private readonly tokenProvider: TokenProvider) {}

  async execute(token: string): Promise<Result<TokenClaims, AppError>> {
    return this.tokenProvider.verify(token);
  }
}
