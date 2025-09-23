import { RoleEnum } from '../../enums/roleEnums';
import { AppError } from '../../errors/appError';
import { PermissionDeniedError, ValidationError } from '../../errors/errors';
import { Err, Result } from '../../errors/result';
import { UserRepository } from '../../interfaces/userRepository';
import { TokenProvider } from '../../providers/tokenProvider';
import { PasswordHasher } from '../../providers/passwordHash';
import { hasRoles } from '../../utils/hasRoles';
import { User } from '../../entities/user/user';
import { GenerateTokenUseCase } from '../token/generateTokenUseCase';

export interface AuthenticateUserCommand {
  email: string;
  password: string;
}

export class AuthenticateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenProvider: TokenProvider,
    private readonly passwordHasher: PasswordHasher,
    private readonly user: User
  ) {}

  async execute(
    command: AuthenticateUserCommand
  ): Promise<Result<string, AppError>> {
    if (!hasRoles(this.user, RoleEnum.STAGIAIRE)) {
      return Err.of(new PermissionDeniedError('Accès refusé : rôle requis'));
    }

    if (!command.email) {
      return Err.of(new ValidationError("L'email est obligatoire"));
    }

    if (!command.password) {
      return Err.of(new ValidationError('Le mot de passe est obligatoire'));
    }

    const userResult = await this.userRepository.getUserByEmail(command.email);
    if (userResult.isErr()) {
      return Err.of(new ValidationError('Identifiants incorrects'));
    }

    const user = userResult.value;
    const isValid = await this.passwordHasher.compare(
      command.password,
      user.password
    );

    if (!isValid) {
      return Err.of(new ValidationError('Identifiants incorrects'));
    }

    const generateTokenUseCase = new GenerateTokenUseCase(this.tokenProvider);

    return generateTokenUseCase.execute(user);
  }
}
