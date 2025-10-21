import { jest } from '@jest/globals';
import { UpdateQuestionnaireUseCase } from '../../../usecases/questionnaire/updateQuestionnaireUseCase';
import { QuestionnaireRepository } from '../../../interfaces/questionnaireRepository';
import { Err, Ok } from '../../../errors/result';
import {
  PermissionDeniedError,
  TechnicalError,
  ValidationError,
} from '../../../errors/errors';
import { RoleEnum } from '../../../enums/roleEnums';
import { userBuilder } from '../../builders/user-builder';
import { questionnaireBuilder } from '../../builders/questionnaire-builder';
import { UpdateQuestionnaireCommand } from '../../../commands/questionnaire/updateQuestionnaireCommand';
import { User } from '../../../entities/user/user';
import { Questionnaire } from '../../../entities/questionnaire/questionnaire';

describe('Feature: UpdateQuestionnaireUseCase', () => {
  let questionnaireRepository: jest.Mocked<QuestionnaireRepository>;
  let useCase: UpdateQuestionnaireUseCase;
  let stagiaireUser: User;
  let adminUser: User;
  let command: UpdateQuestionnaireCommand;
  let existing: Questionnaire;

  beforeEach(() => {
    questionnaireRepository = {
      getQuestionnaireByName: jest.fn(),
      getQuestionnaireById: jest.fn(),
      createQuestionnaire: jest.fn(),
      getAllQuestionnaires: jest.fn(),
      updateQuestionnaire: jest.fn(),
      deleteQuestionnaire: jest.fn(),
    };

    useCase = new UpdateQuestionnaireUseCase(questionnaireRepository);

    adminUser = userBuilder().withRole(RoleEnum.ADMIN).build();
    stagiaireUser = userBuilder().withRole(RoleEnum.STAGIAIRE).build();

    existing = questionnaireBuilder()
      .withId(10)
      .withName('Onboarding')
      .withDescription('Desc')
      .build();

    command = {
      id: existing.id,
      name: existing.name,
      description: existing.description,
      isActive: existing.isActive,
      updatedAt: new Date(),
    };
  });

  it('should return PermissionDeniedError if current user is not ADMIN', async () => {
    const result = await useCase.execute(stagiaireUser, command);

    expect(result).toEqual(
      Err.of(
        new PermissionDeniedError(
          'Seul un administrateur peut modifier un questionnaire'
        )
      )
    );
    expect(questionnaireRepository.updateQuestionnaire).not.toHaveBeenCalled();
  });

  it('should return ValidationError if name is empty', async () => {
    command.name = '';

    const result = await useCase.execute(adminUser, command);

    expect(result).toEqual(
      Err.of(new ValidationError('Le nom du questionnaire est obligatoire'))
    );
    expect(questionnaireRepository.updateQuestionnaire).not.toHaveBeenCalled();
  });

  it('should return TechnicalError if repository fails', async () => {
    questionnaireRepository.updateQuestionnaire.mockResolvedValueOnce(
      Err.of(new TechnicalError('DB error'))
    );

    const result = await useCase.execute(adminUser, command);

    expect(result).toEqual(
      Err.of(
        new TechnicalError(
          'Erreur technique lors de la mise à jour du questionnaire'
        )
      )
    );
    expect(questionnaireRepository.updateQuestionnaire).toHaveBeenCalledWith(
      command
    );
  });

  it('should update questionnaire successfully', async () => {
    const updated = {
      ...existing,
      name: 'Nouveau nom',
      description: 'Nouvelle description',
      updatedAt: new Date(),
    };
    command.name = 'Nouveau nom';
    command.description = 'Nouvelle description';

    questionnaireRepository.updateQuestionnaire.mockResolvedValueOnce(
      Ok.of(updated)
    );

    const result = await useCase.execute(adminUser, command);

    expect(result).toEqual(Ok.of(updated));
    expect(questionnaireRepository.updateQuestionnaire).toHaveBeenCalledWith(
      command
    );
  });
});
