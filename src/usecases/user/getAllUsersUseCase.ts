import { UserRepository } from '../../interfaces/userRepository';
import { Result, Ok, Err } from '../../errors/result';
import { AppError } from '../../errors/appError';
import { User } from '../../entities/user/user';
import { RoleEnum } from '../../enums/roleEnums';
import { hasRoles } from '../../utils/hasRoles';
import {
  PermissionDeniedError,
  TechnicalError,
  ValidationError,
} from '../../errors/errors';

export class GetAllUsersUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(currentUser: User): Promise<Result<User[], AppError>> {
    if (!currentUser) {
      return Err.of(
        new ValidationError('Utilisateur courant manquant pour la récupération')
      );
    }

    if (!hasRoles(currentUser, RoleEnum.ADMIN)) {
      return Err.of(
        new PermissionDeniedError(
          'Seul un administrateur peut accéder à la liste des utilisateurs'
        )
      );
    }

    const result = await this.userRepo.getAllUsers();

    if (result.isErr()) {
      return Err.of(
        new TechnicalError(
          'Erreur technique lors de la récupération des utilisateurs'
        )
      );
    }

    const stagiaires = result.value.filter(
      (user: User) => user.roleId === RoleEnum.STAGIAIRE
    );

    return Ok.of(stagiaires);
  }
}
