import { TokenClaims } from '../entities/auth/tokenClaims';
import { AppError } from '../errors/appError';
import { Result } from '../errors/result';

export interface TokenProvider {
  generate(payload: TokenClaims): Promise<string>;
  verify(token: string): Promise<Result<TokenClaims, AppError>>;
}
