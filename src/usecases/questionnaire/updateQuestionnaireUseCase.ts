import { QuestionnaireRepository } from '../../interfaces/questionnaireRepository';
import { User } from '../../entities/user/user';
import { RoleEnum } from '../../enums/roleEnums';
import { UpdateQuestionnaireCommand } from '../../commands/questionnaire/updateQuestionnaireCommand';
import { Result, Err, Ok } from '../../errors/result';
import { AppError } from '../../errors/appError';
import {
  PermissionDeniedError,
  TechnicalError,
  ValidationError,
} from '../../errors/errors';
import { Questionnaire } from '../../entities/questionnaire/questionnaire';

export class UpdateQuestionnaireUseCase {
  constructor(
    private readonly questionnaireRepository: QuestionnaireRepository
  ) {}

  async execute(
    currentUser: User,
    command: UpdateQuestionnaireCommand
  ): Promise<Result<Questionnaire, AppError>> {
    if (currentUser.roleId != RoleEnum.ADMIN) {
      return Err.of(
        new PermissionDeniedError(
          'Seul un administrateur peut modifier un questionnaire'
        )
      );
    }

    if (!command.name || command.name.trim().length == 0) {
      return Err.of(
        new ValidationError('Le nom du questionnaire est obligatoire')
      );
    }

    command.name = command.name.trim();
    if (command.description !== undefined) {
      command.description = command.description.trim();
    }

    const result =
      await this.questionnaireRepository.updateQuestionnaire(command);
    if (result.isErr()) {
      return Err.of(
        new TechnicalError(
          'Erreur technique lors de la mise à jour du questionnaire'
        )
      );
    }

    return Ok.of(result.value);
  }
}
