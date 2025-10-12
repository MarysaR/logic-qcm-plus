import { Result, Ok, Err } from '../../errors/result';
import { AppError } from '../../errors/appError';
import { Questionnaire } from '../../entities/questionnaire/questionnaire';
import { QuestionnaireRepository } from '../../interfaces/questionnaireRepository';
import { User } from '../../entities/user/user';
import { RoleEnum } from '../../enums/roleEnums';
import { hasRoles } from '../../utils/hasRoles';
import { PermissionDeniedError, TechnicalError } from '../../errors/errors';

export class GetAllQuestionnairesUseCase {
  constructor(private readonly questionnaireRepo: QuestionnaireRepository) {}

  async execute(currentUser: User): Promise<Result<Questionnaire[], AppError>> {
    if (!hasRoles(currentUser, RoleEnum.ADMIN)) {
      return Err.of(
        new PermissionDeniedError(
          'Seul un administrateur peut consulter la liste des questionnaires'
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

    return Ok.of(result.value);
  }
}
