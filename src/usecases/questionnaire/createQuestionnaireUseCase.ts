import { Result, Ok, Err } from '../../errors/result';
import { AppError } from '../../errors/appError';
import {
  ValidationError,
  AlreadyExistError,
  NotFoundError,
  TechnicalError,
  PermissionDeniedError,
} from '../../errors/errors';
import { QuestionnaireRepository } from '../../interfaces/questionnaireRepository';
import { Questionnaire } from '../../entities/questionnaire/questionnaire';
import { CreateQuestionnaireCommand } from '../../commands/questionnaire/createQuestionnaireCommand';
import { User } from '../../entities/user/user';
import { RoleEnum } from '../../enums/roleEnums';

export class CreateQuestionnaireUseCase {
  constructor(private readonly questionnaireRepo: QuestionnaireRepository) {}

  public async execute(
    currentUser: User,
    command: CreateQuestionnaireCommand
  ): Promise<Result<void, AppError>> {
    if (currentUser.roleId !== RoleEnum.ADMIN) {
      return Err.of(
        new PermissionDeniedError(
          'Seul un administrateur peut créer un questionnaire'
        )
      );
    }

    const name = command.name?.trim();
    if (!name) {
      return Err.of(
        new ValidationError('Le nom du questionnaire est obligatoire')
      );
    }

    const existing = await this.questionnaireRepo.getQuestionnaireByName(name);
    if (existing.isOk()) {
      return Err.of(
        new AlreadyExistError('Un questionnaire avec ce nom existe déjà')
      );
    }
    if (existing.isErr() && !(existing.error instanceof NotFoundError)) {
      return Err.of(
        new TechnicalError("Erreur lors de la vérification d'existence")
      );
    }

    const questionnaire: Questionnaire = {
      id: 0,
      name: command.name,
      description: command.description,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const created =
      await this.questionnaireRepo.createQuestionnaire(questionnaire);
    if (created.isErr()) {
      return Err.of(
        new TechnicalError(
          'Erreur technique lors de la création du questionnaire'
        )
      );
    }

    return Ok.of(undefined);
  }
}
