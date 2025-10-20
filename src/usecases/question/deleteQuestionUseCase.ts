import { QuestionRepository } from '../../interfaces/questionRepository';
import { User } from '../../entities/user/user';
import { RoleEnum } from '../../enums/roleEnums';
import { Result, Err, Ok } from '../../errors/result';
import { AppError } from '../../errors/appError';
import {
  PermissionDeniedError,
  NotFoundError,
  TechnicalError,
} from '../../errors/errors';

export class DeleteQuestionUseCase {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async execute(
    currentUser: User,
    questionId: number
  ): Promise<Result<void, AppError>> {
    if (currentUser.roleId != RoleEnum.ADMIN) {
      return Err.of(
        new PermissionDeniedError(
          'Seul un administrateur peut supprimer une question'
        )
      );
    }

    const result = await this.questionRepository.deleteQuestion(questionId);
    if (result.isErr()) {
      const error = result.error;
      if (error instanceof NotFoundError) {
        return Err.of(new NotFoundError('Question introuvable'));
      }

      return Err.of(
        new TechnicalError(
          'Erreur technique lors de la suppression de la question'
        )
      );
    }

    return Ok.of(undefined);
  }
}
