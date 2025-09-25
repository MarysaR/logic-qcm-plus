import { AppError } from '../../errors/appError';
import { PermissionDeniedError, ValidationError } from '../../errors/errors';
import { Err, Result } from '../../errors/result';
import { UserRepository } from '../../interfaces/userRepository';
import { TokenProvider } from '../../providers/tokenProvider';
import { PasswordHasher } from '../../providers/passwordHash';
import { GenerateTokenUseCase } from '../token/generateTokenUseCase';

export interface AuthenticateUserCommand {
  email: string;
  password: string;
}

export class AuthenticateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenProvider: TokenProvider,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(
    command: AuthenticateUserCommand
  ): Promise<Result<string, AppError>> {
    const email = command.email.trim().toLowerCase();
    const password = command.password.trim();

    if (!email) {
      return Err.of(new ValidationError("L'email est obligatoire"));
    }

    if (!password) {
      return Err.of(new ValidationError('Le mot de passe est obligatoire'));
    }

    const userResult = await this.userRepository.getUserByEmail(email);
    if (userResult.isErr()) {
      return Err.of(new PermissionDeniedError('Identifiants incorrects'));
    }

    const user = userResult.value;
    const isValid = await this.passwordHasher.compare(password, user.password);

    if (!isValid) {
      return Err.of(new ValidationError('Identifiants incorrects'));
    }

    const generateTokenUseCase = new GenerateTokenUseCase(this.tokenProvider);
    return generateTokenUseCase.execute(user);
  }
}
