import { QuestionnaireRepository } from '../../interfaces/questionnaireRepository';
import { Result, Err, Ok } from '../../errors/result';
import { AppError } from '../../errors/appError';
import {
  NotFoundError,
  PermissionDeniedError,
  TechnicalError,
  ValidationError,
} from '../../errors/errors';
import { User } from '../../entities/user/user';
import { Questionnaire } from '../../entities/questionnaire/questionnaire';
import { RoleEnum } from '../../enums/roleEnums';

export class GetQuestionnaireByIdUseCase {
  constructor(
    private readonly questionnaireRepository: QuestionnaireRepository
  ) {}

  async execute(
    currentUser: User,
    id: number
  ): Promise<Result<Questionnaire, AppError>> {
    if (currentUser.roleId != RoleEnum.ADMIN) {
      return Err.of(
        new PermissionDeniedError(
          'Seul un administrateur peut consulter un questionnaire'
        )
      );
    }

    if (!id || id <= 0 || isNaN(id)) {
      return Err.of(
        new ValidationError('Identifiant de questionnaire invalide')
      );
    }

    const result = await this.questionnaireRepository.getQuestionnaireById(id);
    if (result.isErr()) {
      const error = result.error;
      if (error instanceof NotFoundError) {
        return Err.of(new NotFoundError('Questionnaire introuvable'));
      }

      return Err.of(
        new TechnicalError(
          'Erreur technique lors de la récupération du questionnaire'
        )
      );
    }

    return Ok.of(result.value);
  }
}
