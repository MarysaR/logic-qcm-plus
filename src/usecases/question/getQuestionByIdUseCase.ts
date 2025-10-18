import { QuestionRepository } from '../../interfaces/questionRepository';
import { Result, Err, Ok } from '../../errors/result';
import { AppError } from '../../errors/appError';
import { Question } from '../../entities/question/question';
import { RoleEnum } from '../../enums/roleEnums';
import {
  PermissionDeniedError,
  NotFoundError,
  TechnicalError,
} from '../../errors/errors';
import { User } from '../../entities/user/user';

export class GetQuestionByIdUseCase {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async execute(
    currentUser: User,
    questionId: number
  ): Promise<Result<Question, AppError>> {
    if (currentUser.roleId != RoleEnum.ADMIN) {
      return Err.of(
        new PermissionDeniedError(
          'Seul un administrateur peut consulter une question'
        )
      );
    }

    const result = await this.questionRepository.getQuestionById(questionId);
    if (result.isErr()) {
      const error = result.error;

      if (error instanceof NotFoundError) {
        return Err.of(new NotFoundError('Question introuvable'));
      }

      return Err.of(
        new TechnicalError(
          'Erreur technique lors de la récupération de la question'
        )
      );
    }

    return Ok.of(result.value);
  }
}
