import { QuestionnaireRepository } from '../../interfaces/questionnaireRepository';
import { User } from '../../entities/user/user';
import { RoleEnum } from '../../enums/roleEnums';
import { Result, Err, Ok } from '../../errors/result';
import { AppError } from '../../errors/appError';
import {
  PermissionDeniedError,
  NotFoundError,
  TechnicalError,
} from '../../errors/errors';

export class DeleteQuestionnaireUseCase {
  constructor(
    private readonly questionnaireRepository: QuestionnaireRepository
  ) {}

  async execute(
    currentUser: User,
    questionnaireId: number
  ): Promise<Result<void, AppError>> {
    if (currentUser.roleId != RoleEnum.ADMIN) {
      return Err.of(
        new PermissionDeniedError(
          'Seul un administrateur peut supprimer un questionnaire'
        )
      );
    }

    const result =
      await this.questionnaireRepository.deleteQuestionnaire(questionnaireId);
    if (result.isErr()) {
      const error = result.error;
      if (error instanceof NotFoundError) {
        return Err.of(new NotFoundError('Questionnaire introuvable'));
      }
      return Err.of(
        new TechnicalError(
          'Erreur technique lors de la suppression du questionnaire'
        )
      );
    }

    return Ok.of(undefined);
  }
}
