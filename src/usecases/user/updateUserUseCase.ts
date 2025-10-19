import { UserRepository } from '../../interfaces/userRepository';
import { Result, Ok, Err } from '../../errors/result';
import { AppError } from '../../errors/appError';
import { User } from '../../entities/user/user';
import { ValidationError, PermissionDeniedError, TechnicalError } from '../../errors/errors';
import { RoleEnum } from '../../enums/roleEnums';
import { hasRoles } from '../../utils/hasRoles';

export class UpdateUserUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(currentUser: User, updatedUser: Partial<User>): Promise<Result<User, AppError>> {
    if (!currentUser) {
      return Err.of(new ValidationError('Utilisateur courant manquant'));
    }

    if (!hasRoles(currentUser, RoleEnum.ADMIN)) {
      return Err.of(new PermissionDeniedError('Seul un administrateur peut modifier un utilisateur'));
    }

    if (!updatedUser.id) {
      return Err.of(new ValidationError('ID de l’utilisateur à modifier manquant'));
    }

    const result = await this.userRepo.updateUser(updatedUser);

    if (result.isErr()) {
      return Err.of(new TechnicalError('Erreur technique lors de la mise à jour de l’utilisateur'));
    }

    return Ok.of(result.value);
  }
}