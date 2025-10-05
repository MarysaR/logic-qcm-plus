import { jest } from '@jest/globals';
import { CreateQuestionnaireUseCase } from '../../../usecases/questionnaire/createQuestionnaireUseCase';
import { QuestionnaireRepository } from '../../../interfaces/questionnaireRepository';
import { Questionnaire } from '../../../entities/questionnaire/questionnaire';
import {
  ValidationError,
  AlreadyExistError,
  NotFoundError,
  TechnicalError,
} from '../../../errors/errors';
import { Ok, Err } from '../../../errors/result';

describe('CreateQuestionnaireUseCase', () => {
  let questionnaireRepository: jest.Mocked<QuestionnaireRepository>;
  let useCase: CreateQuestionnaireUseCase;
  let questionnaire: Questionnaire;

  beforeEach(() => {
    questionnaireRepository = {
      getQuestionnaireByName: jest.fn(),
      createQuestionnaire: jest.fn(),
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
  });

  it('should return ValidationError when name empty', async () => {
    const result = await useCase.execute({ name: '   ' });
    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect(result.error).toBeInstanceOf(ValidationError);
  });

  it('should return AlreadyExistError when name already exists', async () => {
    questionnaireRepository.getQuestionnaireByName.mockResolvedValueOnce(
      Ok.of(questionnaire)
    );

    const result = await useCase.execute({ name: 'Onboarding' });

    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect(result.error).toBeInstanceOf(AlreadyExistError);
  });

  it('should create questionnaire when name is free', async () => {
    questionnaireRepository.getQuestionnaireByName.mockResolvedValueOnce(
      Err.of(new NotFoundError())
    );
    questionnaireRepository.createQuestionnaire.mockResolvedValueOnce(
      Ok.of(undefined)
    );

    const result = await useCase.execute({
      name: 'Security',
      description: 'Internal awareness',
    });

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.name).toBe('Security');
    }
  });

  it('should propagate technical error on lookup (not NotFound)', async () => {
    questionnaireRepository.getQuestionnaireByName.mockResolvedValueOnce(
      Err.of(new TechnicalError('DB failure'))
    );

    const result = await useCase.execute({ name: 'Any' });

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

    const result = await useCase.execute({ name: 'Fail' });

    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect(result.error).toBeInstanceOf(TechnicalError);
  });
});
