import { jest } from '@jest/globals';
import { CreateQuestionnaireUseCase } from '../../../usecases/questionnaire/createQuestionnaireUseCase';
import { QuestionnaireRepository } from '../../../interfaces/questionnaireRepository';
import { Questionnaire } from '../../../entities/questionnaire/questionnaire';
import {
  ValidationError,
  AlreadyExistError,
  NotFoundError,
  TechnicalError,
  PermissionDeniedError,
} from '../../../errors/errors';
import { Ok, Err } from '../../../errors/result';
import { User } from '../../../entities/user/user';
import { userBuilder } from '../../builders/user-builder';
import { RoleEnum } from '../../../enums/roleEnums';

describe('CreateQuestionnaireUseCase', () => {
  let questionnaireRepository: jest.Mocked<QuestionnaireRepository>;
  let useCase: CreateQuestionnaireUseCase;
  let questionnaire: Questionnaire;
  let adminUser: User;
  let stagiaireUser: User;

  beforeEach(() => {
    questionnaireRepository = {
      getQuestionnaireByName: jest.fn(),
      createQuestionnaire: jest.fn(),
      getQuestionnaireById: jest.fn(),
      getAllQuestionnaires: jest.fn(),
    };
    useCase = new CreateQuestionnaireUseCase(questionnaireRepository);
    questionnaire = {
      id: 1,
      name: 'Onboarding',
      description: 'Desc',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    adminUser = userBuilder().withRole(RoleEnum.ADMIN).build();
    stagiaireUser = userBuilder().withRole(RoleEnum.STAGIAIRE).build();
  });

  it('should return PermissionDeniedError if current user is not ADMIN', async () => {
    const result = await useCase.execute(stagiaireUser, { name: 'NewQ' });
    expect(result).toEqual(
      Err.of(
        new PermissionDeniedError(
          'Seul un administrateur peut créer un questionnaire'
        )
      )
    );
    expect(
      questionnaireRepository.getQuestionnaireByName
    ).not.toHaveBeenCalled();
    expect(questionnaireRepository.createQuestionnaire).not.toHaveBeenCalled();
  });

  it('should return ValidationError when name empty', async () => {
    const result = await useCase.execute(adminUser, { name: '   ' });
    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect(result.error).toBeInstanceOf(ValidationError);
  });

  it('should return AlreadyExistError when name already exists', async () => {
    questionnaireRepository.getQuestionnaireByName.mockResolvedValueOnce(
      Ok.of(questionnaire)
    );

    const result = await useCase.execute(adminUser, { name: 'Onboarding' });

    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect(result.error).toBeInstanceOf(AlreadyExistError);
  });

  it('should create questionnaire when name is not found', async () => {
    questionnaireRepository.getQuestionnaireByName.mockResolvedValueOnce(
      Err.of(new NotFoundError())
    );
    questionnaireRepository.createQuestionnaire.mockResolvedValueOnce(
      Ok.of(undefined)
    );

    const result = await useCase.execute(adminUser, {
      name: 'Security',
      description: 'Internal awareness',
    });

    expect(result.isOk()).toBe(true);
    expect(questionnaireRepository.createQuestionnaire).toHaveBeenCalled();
    if (questionnaireRepository.createQuestionnaire.mock.calls.length > 0) {
      const createdArg =
        questionnaireRepository.createQuestionnaire.mock.calls[0][0];
      expect(createdArg.name).toBe('Security');
    }
  });

  it('should propagate technical error on lookup (not NotFound)', async () => {
    questionnaireRepository.getQuestionnaireByName.mockResolvedValueOnce(
      Err.of(new TechnicalError('DB failure'))
    );

    const result = await useCase.execute(adminUser, { name: 'Any' });

    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect(result.error).toBeInstanceOf(TechnicalError);
  });

  it('propagates technical error on create', async () => {
    questionnaireRepository.getQuestionnaireByName.mockResolvedValueOnce(
      Err.of(new NotFoundError())
    );
    questionnaireRepository.createQuestionnaire.mockResolvedValueOnce(
      Err.of(new TechnicalError('Insert failed'))
    );

    const result = await useCase.execute(adminUser, { name: 'Fail' });

    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect(result.error).toBeInstanceOf(TechnicalError);
  });
});
