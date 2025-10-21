import { QuestionRepository } from '../../interfaces/questionRepository';
import { Result, Err, Ok } from '../../errors/result';
import { AppError } from '../../errors/appError';
import {
  PermissionDeniedError,
  TechnicalError,
  ValidationError,
} from '../../errors/errors';
import { User } from '../../entities/user/user';
import { RoleEnum } from '../../enums/roleEnums';
import { Question } from '../../entities/question/question';

export class GetQuestionsOfQuestionnaireUseCase {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async execute(
    currentUser: User,
    questionnaireId: number
  ): Promise<Result<Question[], AppError>> {
    if (currentUser.roleId != RoleEnum.ADMIN) {
      return Err.of(
        new PermissionDeniedError(
          'Seul un administrateur peut consulter les questions d’un questionnaire'
        )
      );
    }

    if (!questionnaireId || questionnaireId <= 0 || isNaN(questionnaireId)) {
      return Err.of(
        new ValidationError('Identifiant de questionnaire invalide')
      );
    }

    const result =
      await this.questionRepository.getQuestionsOfQuestionnaire(
        questionnaireId
      );

    if (result.isErr()) {
      return Err.of(
        new TechnicalError(
          'Erreur technique lors de la récupération des questions'
        )
      );
    }

    if (result.value.length == 0) {
      return Ok.of([]);
    }

    return Ok.of(result.value);
  }
}
