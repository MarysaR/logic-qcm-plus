import { UserRepository } from '../../interfaces/userRepository';
import { User } from '../../entities/user/user';
import {
  ValidationError,
  AlreadyExistError,
  PermissionDeniedError,
} from '../../errors/errors';
import { AppError, Err, Result, Ok } from '../../errors';
import { PasswordHasher } from '../../providers';

export class CreateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async createUser(
    currentUserRoleId: number,
    user: User
  ): Promise<Result<{ isOk: () => boolean }, AppError>> {
    if (currentUserRoleId != 1) {
      return Err.of(
        new PermissionDeniedError(
          'Vous n’avez pas les droits pour créer un utilisateur.'
        )
      );
    }

    const requiredFields = [
      user.login,
      user.email,
      user.password,
      user.firstName,
      user.lastName,
      user.company,
    ];

    if (requiredFields.some((field) => !field || String(field).trim() == '')) {
      return Err.of(
        new ValidationError(
          'All fields are required: login, email, password, firstName, lastName, company'
        )
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      return Err.of(new ValidationError('Invalid email format.'));
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(user.password)) {
      return Err.of(
        new ValidationError(
          'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
        )
      );
    }

    const userEmailAlreadyExists = await this.userRepository.getUserByEmail(
      user.email
    );
    if (userEmailAlreadyExists.isOk()) {
      return Err.of(
        new AlreadyExistError(`L'email "${user.email}" est déjà utilisé.`)
      );
    }

    user.createdAt = new Date();
    user.isActive = true;

    user.password = await this.passwordHasher.hash(user.password);

    user.roleId = 2;

    await this.userRepository.createUser(user);

    return Ok.of<{ isOk: () => boolean }, AppError>({ isOk: () => true });
  }
}
