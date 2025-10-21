import { jest } from '@jest/globals';
import { DeleteQuestionnaireUseCase } from '../../../usecases/questionnaire/deleteQuestionnaireUseCase';
import { QuestionnaireRepository } from '../../../interfaces/questionnaireRepository';
import { RoleEnum } from '../../../enums/roleEnums';
import { userBuilder } from '../../builders/user-builder';
import { Err, Ok } from '../../../errors/result';
import {
  PermissionDeniedError,
  NotFoundError,
  TechnicalError,
} from '../../../errors/errors';

describe('Feature: DeleteQuestionnaireUseCase', () => {
  let questionnaireRepository: jest.Mocked<QuestionnaireRepository>;
  let useCase: DeleteQuestionnaireUseCase;
  let adminUser = userBuilder().withRole(RoleEnum.ADMIN).build();
  let stagiaireUser = userBuilder().withRole(RoleEnum.STAGIAIRE).build();

  beforeEach(() => {
    questionnaireRepository = {
      getQuestionnaireByName: jest.fn(),
      getQuestionnaireById: jest.fn(),
      createQuestionnaire: jest.fn(),
      getAllQuestionnaires: jest.fn(),
      updateQuestionnaire: jest.fn(),
      deleteQuestionnaire: jest.fn(),
    };
    useCase = new DeleteQuestionnaireUseCase(questionnaireRepository);
  });

  it('should return PermissionDeniedError if user is not ADMIN', async () => {
    const result = await useCase.execute(stagiaireUser, 1);
    expect(result).toEqual(
      Err.of(
        new PermissionDeniedError(
          'Seul un administrateur peut supprimer un questionnaire'
        )
      )
    );
    expect(questionnaireRepository.deleteQuestionnaire).not.toHaveBeenCalled();
  });

  it('should return NotFoundError if questionnaire does not exist', async () => {
    questionnaireRepository.deleteQuestionnaire.mockResolvedValueOnce(
      Err.of(new NotFoundError('Questionnaire introuvable'))
    );

    const result = await useCase.execute(adminUser, 99);
    expect(result).toEqual(
      Err.of(new NotFoundError('Questionnaire introuvable'))
    );
    expect(questionnaireRepository.deleteQuestionnaire).toHaveBeenCalledWith(
      99
    );
  });

  it('should return TechnicalError for generic repository error', async () => {
    questionnaireRepository.deleteQuestionnaire.mockResolvedValueOnce(
      Err.of(new TechnicalError('DB error'))
    );

    const result = await useCase.execute(adminUser, 2);
    expect(result).toEqual(
      Err.of(
        new TechnicalError(
          'Erreur technique lors de la suppression du questionnaire'
        )
      )
    );
    expect(questionnaireRepository.deleteQuestionnaire).toHaveBeenCalledWith(2);
  });

  it('should delete questionnaire successfully', async () => {
    questionnaireRepository.deleteQuestionnaire.mockResolvedValueOnce(
      Ok.of(undefined)
    );

    const result = await useCase.execute(adminUser, 3);
    expect(result).toEqual(Ok.of(undefined));
    expect(questionnaireRepository.deleteQuestionnaire).toHaveBeenCalledWith(3);
  });
});
