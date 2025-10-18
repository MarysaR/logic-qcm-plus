import { jest } from '@jest/globals';
import { GetQuestionnaireByIdUseCase } from '../../../usecases/questionnaire/getQuestionnaireByIdUseCase';
import { QuestionnaireRepository } from '../../../interfaces/questionnaireRepository';
import {
  NotFoundError,
  PermissionDeniedError,
  ValidationError,
} from '../../../errors/errors';
import { Err, Ok } from '../../../errors/result';
import { RoleEnum } from '../../../enums/roleEnums';
import { userBuilder } from '../../builders/user-builder';

describe('Feature: GetQuestionnaireByIdUseCase', () => {
  let questionnaireRepository: jest.Mocked<QuestionnaireRepository>;
  let useCase: GetQuestionnaireByIdUseCase;

  beforeEach(() => {
    questionnaireRepository = {
      getQuestionnaireById: jest.fn(),
      getQuestionnaireByName: jest.fn(),
      createQuestionnaire: jest.fn(),
      getAllQuestionnaires: jest.fn(),
      updateQuestionnaire: jest.fn(),
    };

    useCase = new GetQuestionnaireByIdUseCase(questionnaireRepository);
  });

  it('should return PermissionDeniedError if current user is not ADMIN', async () => {
    const stagiaireUser = userBuilder().withRole(RoleEnum.STAGIAIRE).build();

    const result = await useCase.execute(stagiaireUser, 1);

    expect(result).toEqual(
      Err.of(
        new PermissionDeniedError(
          'Seul un administrateur peut consulter un questionnaire'
        )
      )
    );
    expect(questionnaireRepository.getQuestionnaireById).not.toHaveBeenCalled();
  });

  it('should return ValidationError if id is invalid', async () => {
    const adminUser = userBuilder().withRole(RoleEnum.ADMIN).build();

    const result = await useCase.execute(adminUser, 0);

    expect(result).toEqual(
      Err.of(new ValidationError('Identifiant de questionnaire invalide'))
    );
    expect(questionnaireRepository.getQuestionnaireById).not.toHaveBeenCalled();
  });

  it('should return NotFoundError if questionnaire does not exist', async () => {
    const adminUser = userBuilder().withRole(RoleEnum.ADMIN).build();

    questionnaireRepository.getQuestionnaireById.mockResolvedValueOnce(
      Err.of(new NotFoundError('Questionnaire introuvable'))
    );

    const result = await useCase.execute(adminUser, 99);

    expect(result).toEqual(
      Err.of(new NotFoundError('Questionnaire introuvable'))
    );
    expect(questionnaireRepository.getQuestionnaireById).toHaveBeenCalledWith(
      99
    );
  });

  it('should return Ok if questionnaire exists', async () => {
    const adminUser = userBuilder().withRole(RoleEnum.ADMIN).build();
    const questionnaire = {
      id: 1,
      name: 'Onboarding',
      description: 'Desc',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    questionnaireRepository.getQuestionnaireById.mockResolvedValueOnce(
      Ok.of(questionnaire)
    );

    const result = await useCase.execute(adminUser, 1);

    expect(result).toEqual(Ok.of(questionnaire));
    expect(questionnaireRepository.getQuestionnaireById).toHaveBeenCalledWith(
      1
    );
  });
});
