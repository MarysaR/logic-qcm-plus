import { QuestionnaireRepository } from '../../interfaces/questionnaireRepository';
import { Result, Ok, Err } from '../../errors/result';
import { AppError } from '../../errors/appError';
import { Questionnaire } from '../../entities/questionnaire/questionnaire';
import { User } from '../../entities/user/user';
import { RoleEnum } from '../../enums/roleEnums';
import { hasRoles } from '../../utils/hasRoles';
import {
  PermissionDeniedError,
  TechnicalError,
  ValidationError,
} from '../../errors/errors';

export class GetAllQuestionnairesUseCase {
  constructor(private readonly questionnaireRepo: QuestionnaireRepository) {}

  async execute(currentUser: User): Promise<Result<Questionnaire[], AppError>> {
    if (!currentUser) {
      return Err.of(
        new ValidationError('Utilisateur courant manquant pour la récupération')
      );
    }

    if (
      !hasRoles(currentUser, RoleEnum.ADMIN) &&
      !hasRoles(currentUser, RoleEnum.STAGIAIRE)
    ) {
      return Err.of(
        new PermissionDeniedError(
          'Rôle non autorisé à consulter les questionnaires'
        )
      );
    }

    const result = await this.questionnaireRepo.getAllQuestionnaires();

    if (result.isErr()) {
      return Err.of(
        new TechnicalError(
          'Erreur technique lors de la récupération des questionnaires'
        )
      );
    }

    if (currentUser.roleId == RoleEnum.ADMIN) {
      return Ok.of(result.value);
    }

    if (currentUser.roleId == RoleEnum.STAGIAIRE) {
      const onlyActive = result.value.filter((q) => q.isActive == true);
      return Ok.of(onlyActive);
    }

    return Ok.of(result.value);
  }
}
