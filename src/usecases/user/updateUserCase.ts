import { UserRepository } from '../../interfaces/userRepository';
import { Result, Ok, Err } from '../../errors/result';
import { AppError } from '../../errors/appError';
import { User } from '../../entities/user/user';
import {
  ValidationError,
  PermissionDeniedError,
  TechnicalError,
} from '../../errors/errors';
import { RoleEnum } from '../../enums/roleEnums';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export class UpdateUserUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(
    currentUser: User,
    updatedUser: User
  ): Promise<Result<User, AppError>> {
    if (currentUser.roleId != RoleEnum.ADMIN) {
      return Err.of(
        new PermissionDeniedError(
          'Seul un administrateur peut modifier un questionnaire'
        )
      );
    }

    if (!updatedUser.id) {
      return Err.of(
        new ValidationError('ID de l’utilisateur à modifier manquant')
      );
    }

    if (!updatedUser.firstName || updatedUser.firstName.trim() == '') {
      return Err.of(new ValidationError('Prénom obligatoire'));
    }
    if (!updatedUser.lastName || updatedUser.lastName.trim() == '') {
      return Err.of(new ValidationError('Nom obligatoire'));
    }

    if (!updatedUser.login || updatedUser.login.trim() == '') {
      return Err.of(new ValidationError('Login obligatoire'));
    }

    if (!updatedUser.company || updatedUser.company.trim() == '') {
      return Err.of(new ValidationError('Entreprise obligatoire'));
    }

    if (!updatedUser.email || updatedUser.email.trim() == '') {
      return Err.of(new ValidationError('Email obligatoire'));
    }

    if (!EMAIL_REGEX.test(updatedUser.email)) {
      return Err.of(new ValidationError('Email invalide'));
    }

    if (!updatedUser.password || updatedUser.password.trim() == '') {
      return Err.of(new ValidationError('Mot de passe obligatoire'));
    }
    if (!PASSWORD_REGEX.test(updatedUser.password)) {
      return Err.of(
        new ValidationError(
          'Mot de passe invalide (8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial)'
        )
      );
    }

    const result = await this.userRepo.updateUser(updatedUser);

    if (result.isErr()) {
      return Err.of(
        new TechnicalError(
          'Erreur technique lors de la mise à jour de l’utilisateur'
        )
      );
    }

    return Ok.of(result.value);
  }
}
