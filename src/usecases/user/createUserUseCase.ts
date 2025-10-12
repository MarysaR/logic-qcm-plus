import { UserRepository } from '../../interfaces/userRepository';
import {
  ValidationError,
  AlreadyExistError,
  PermissionDeniedError,
} from '../../errors/errors';
import { AppError, Err, Result, Ok } from '../../errors';
import { PasswordHasher } from '../../providers';
import { RoleEnum } from '../../enums/roleEnums';
import { CreateUserCommand } from '../../commands/user/userCommand';

export class CreateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(command: CreateUserCommand): Promise<Result<void, AppError>> {
    const { currentUser, newUser } = command;
    if (currentUser != RoleEnum.ADMIN) {
      return Err.of(
        new PermissionDeniedError(
          'Vous n’avez pas les droits pour créer un utilisateur.'
        )
      );
    }

    const requiredFields = [
      newUser.login,
      newUser.email,
      newUser.password,
      newUser.firstName,
      newUser.lastName,
      newUser.company,
    ];

    if (requiredFields.some((field) => !field || String(field).trim() == '')) {
      return Err.of(new ValidationError('Tous les champs sont obligatoires'));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      return Err.of(new ValidationError('Email invalide'));
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newUser.password)) {
      return Err.of(
        new ValidationError(
          'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
        )
      );
    }

    const existingUser = await this.userRepository.getUserByEmail(
      newUser.email
    );
    if (existingUser.isOk()) {
      return Err.of(
        new AlreadyExistError(`L'email "${newUser.email}" est déjà utilisé.`)
      );
    }

    newUser.createdAt = new Date();
    newUser.isActive = true;
    newUser.password = await this.passwordHasher.hash(newUser.password);
    newUser.roleId = 2;

    await this.userRepository.createUser(newUser);

    return Ok.of(undefined);
  }
}
