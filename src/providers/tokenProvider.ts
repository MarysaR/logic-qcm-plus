import { TokenClaims } from '../entities/auth/tokenClaims';
import { AppError } from '../errors/appError';
import { Result } from '../errors/result';

export interface TokenProvider {
  generate(payload: TokenClaims): Promise<Result<string, AppError>>;
  verify(token: string): Promise<Result<TokenClaims, AppError>>;
}
