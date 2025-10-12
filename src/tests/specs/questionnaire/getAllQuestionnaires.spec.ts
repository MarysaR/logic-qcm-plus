import { jest } from '@jest/globals';
import { GetAllQuestionnairesUseCase } from '../../../usecases/questionnaire/getAllQuestionnairesUseCase';
import { QuestionnaireRepository } from '../../../interfaces/questionnaireRepository';
import { PermissionDeniedError, TechnicalError } from '../../../errors/errors';
import { Ok, Err } from '../../../errors/result';
import { userBuilder } from '../../builders/user-builder';
import { RoleEnum } from '../../../enums/roleEnums';
import { Questionnaire } from '../../../entities/questionnaire/questionnaire';

describe('Feature: GetAllQuestionnairesUseCase', () => {
  let questionnaireRepository: jest.Mocked<QuestionnaireRepository>;
  let useCase: GetAllQuestionnairesUseCase;
  const adminUser = userBuilder().withRole(RoleEnum.ADMIN).build();
  const stagiaireUser = userBuilder().withRole(RoleEnum.STAGIAIRE).build();

  beforeEach(() => {
    questionnaireRepository = {
      getQuestionnaireByName: jest.fn(),
      getQuestionnaireById: jest.fn(),
      createQuestionnaire: jest.fn(),
      getAllQuestionnaires: jest.fn(),
    };
    useCase = new GetAllQuestionnairesUseCase(questionnaireRepository);
  });

  it('should return PermissionDeniedError if current user is not ADMIN', async () => {
    const result = await useCase.execute(stagiaireUser);
    expect(result).toEqual(
      Err.of(
        new PermissionDeniedError(
          'Seul un administrateur peut consulter la liste des questionnaires'
        )
      )
    );
    expect(questionnaireRepository.getAllQuestionnaires).not.toHaveBeenCalled();
  });

  it('should return empty array when repository returns empty', async () => {
    questionnaireRepository.getAllQuestionnaires.mockResolvedValueOnce(
      Ok.of([])
    );
    const result = await useCase.execute(adminUser);
    expect(result).toEqual(Ok.of([]));
  });

  it('should return questionnaires when repository returns data', async () => {
    const questionnaires: Questionnaire[] = [
      {
        id: 1,
        name: 'Onboarding',
        description: 'Desc',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: 'React',
        description: 'Test',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    questionnaireRepository.getAllQuestionnaires.mockResolvedValueOnce(
      Ok.of(questionnaires)
    );
    const result = await useCase.execute(adminUser);
    expect(result).toEqual(Ok.of(questionnaires));
  });

  it('should return TechnicalError on repository failure', async () => {
    questionnaireRepository.getAllQuestionnaires.mockResolvedValueOnce(
      Err.of(new TechnicalError('db fail'))
    );
    const result = await useCase.execute(adminUser);
    expect(result).toEqual(
      Err.of(
        new TechnicalError(
          'Erreur technique lors de la récupération des questionnaires'
        )
      )
    );
  });
});
