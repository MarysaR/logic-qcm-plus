import { QuestionRepository } from '../../interfaces/questionRepository';
import { User } from '../../entities/user/user';
import { RoleEnum } from '../../enums/roleEnums';
import { UpdateQuestionCommand } from '../../commands/question/updateQuestionCommand';
import { Result, Err, Ok } from '../../errors/result';
import { AppError } from '../../errors/appError';
import {
  PermissionDeniedError,
  TechnicalError,
  ValidationError,
} from '../../errors/errors';
import { Question } from '../../entities/question/question';

export class UpdateQuestionUseCase {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async execute(
    currentUser: User,
    command: UpdateQuestionCommand
  ): Promise<Result<Question, AppError>> {
    if (currentUser.roleId != RoleEnum.ADMIN) {
      return Err.of(
        new PermissionDeniedError(
          'Seul un administrateur peut modifier une question'
        )
      );
    }

    if (!command.label || command.label.trim().length == 0) {
      return Err.of(
        new ValidationError('Le titre de la question est obligatoire')
      );
    }

    if (command.answers.length < 1 || command.answers.length > 4) {
      return Err.of(
        new ValidationError('Une question doit avoir entre 1 et 4 réponses')
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
      if (answer.text.trim().length > 255) {
        return Err.of(
          new ValidationError(
            "Le texte d'une réponse ne doit pas dépasser 255 caractères"
          )
        );
      }
    }

    const result = await this.questionRepository.updateQuestion(command);
    if (result.isErr()) {
      return Err.of(
        new TechnicalError(
          'Erreur technique lors de la mise à jour de la question'
        )
      );
    }

    return Ok.of(result.value);
  }
}
