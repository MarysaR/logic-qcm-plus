import { User } from '../../entities/user/user';
import { UserRepository } from '../../interfaces/userRepository';
import { TokenClaims } from '../../entities/auth/tokenClaims';
import { Result } from '../../errors/result';
import { AppError } from '../../errors/appError';

export class GetCurrentUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(claims: TokenClaims): Promise<Result<User, AppError>> {
    return this.userRepository.getCurrentUser(claims.email);
  }
}
