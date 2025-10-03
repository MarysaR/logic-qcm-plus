import { QuestionRepository } from '../../interfaces/questionRepository';
import { User } from '../../entities/user/user';
import { AppError } from '../../errors/appError';
import { RoleEnum } from '../../enums/roleEnums';
import { Result, Err, Ok } from '../../errors/result';
import {
  PermissionDeniedError,
  TechnicalError,
  ValidationError,
} from '../../errors/errors';
import { CreateQuestionCommand } from '../../commands/question/createQuestionCommand';

export class CreateQuestionUseCase {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async execute(
    currentUser: User,
    command: CreateQuestionCommand
  ): Promise<Result<void, AppError>> {
    if (currentUser.role.name != RoleEnum.ADMIN) {
      return Err.of(
        new PermissionDeniedError(
          'Seul un administrateur peut créer une question'
        )
      );
    }

    if (command.answers.length < 2 || command.answers.length > 4) {
      return Err.of(
        new ValidationError('Une question doit avoir entre 2 et 4 réponses')
      );
    }

    const hasCorrectAnswer = command.answers.some((a) => a.isCorrect);
    if (!hasCorrectAnswer) {
      return Err.of(
        new ValidationError(
          'Une question doit avoir au moins une réponse correcte'
        )
      );
    }

    for (const answer of command.answers) {
      if (!answer.text || answer.text.trim().length == 0) {
        return Err.of(
          new ValidationError("Le texte d'une réponse ne peut pas être vide")
        );
      }
      if (answer.text.length > 255) {
        return Err.of(
          new ValidationError(
            "Le texte d'une réponse ne doit pas dépasser 255 caractères"
          )
        );
      }
    }

    const result = await this.questionRepository.createQuestion(command);
    if (result.isErr()) {
      return Err.of(
        new TechnicalError(
          'Erreur technique lors de la création de la question'
        )
      );
    }

    return Ok.of(undefined);
  }
}
