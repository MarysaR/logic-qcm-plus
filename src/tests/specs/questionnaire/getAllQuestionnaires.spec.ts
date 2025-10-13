import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { GetAllQuestionnairesUseCase } from '../../../usecases/questionnaire/getAllQuestionnairesUseCase';
import { QuestionnaireRepository } from '../../../interfaces/questionnaireRepository';
import {
  PermissionDeniedError,
  TechnicalError,
  ValidationError,
} from '../../../errors/errors';
import { Err, Ok } from '../../../errors/result';
import { RoleEnum } from '../../../enums/roleEnums';
import { Questionnaire } from '../../../entities/questionnaire/questionnaire';
import { User } from '../../../entities/user/user';

describe('Feature: GetAllQuestionnaires', () => {
  let questionnaireRepository: jest.Mocked<QuestionnaireRepository>;
  let getAllQuestionnairesUseCase: GetAllQuestionnairesUseCase;

  let adminUser: User;
  let stagiaireUser: User;

  beforeEach(() => {
    questionnaireRepository = {
      getQuestionnaireByName: jest.fn(),
      getQuestionnaireById: jest.fn(),
      createQuestionnaire: jest.fn(),
      getAllQuestionnaires: jest.fn(),
    };

    getAllQuestionnairesUseCase = new GetAllQuestionnairesUseCase(
      questionnaireRepository
    );

    adminUser = {
      id: 1,
      login: 'admin',
      email: 'admin@test.com',
      password: 'fake-password!',
      firstName: 'Admin',
      lastName: 'User',
      company: 'QCMPlus',
      isActive: true,
      roleId: RoleEnum.ADMIN,
      role: { id: 1, name: 'ADMIN', isActive: true },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    stagiaireUser = {
      id: 2,
      login: 'stagiaire',
      email: 'stagiaire@test.com',
      password: 'fake-password!',
      firstName: 'Stagiaire',
      lastName: 'User',
      company: 'QCMPlus',
      isActive: true,
      roleId: RoleEnum.STAGIAIRE,
      role: { id: 2, name: 'STAGIAIRE', isActive: true },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  it('should return ValidationError if current user is missing', async () => {
    const result = await getAllQuestionnairesUseCase.execute(
      null as unknown as User
    );

    expect(result).toEqual(
      Err.of(
        new ValidationError('Utilisateur courant manquant pour la récupération')
      )
    );
    expect(questionnaireRepository.getAllQuestionnaires).not.toHaveBeenCalled();
  });

  it('should return TechnicalError if repository fails', async () => {
    questionnaireRepository.getAllQuestionnaires.mockResolvedValueOnce(
      Err.of(new TechnicalError('db fail'))
    );

    const result = await getAllQuestionnairesUseCase.execute(adminUser);

    expect(result).toEqual(
      Err.of(
        new TechnicalError(
          'Erreur technique lors de la récupération des questionnaires'
        )
      )
    );
  });

  it('should return all questionnaires for ADMIN', async () => {
    const questionnaires: Questionnaire[] = [
      {
        id: 1,
        name: 'React Basics',
        description: 'Quiz React',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: 'Docker',
        description: 'Quiz Docker',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    questionnaireRepository.getAllQuestionnaires.mockResolvedValueOnce(
      Ok.of(questionnaires)
    );

    const result = await getAllQuestionnairesUseCase.execute(adminUser);

    expect(result).toEqual(Ok.of(questionnaires));
    expect(questionnaireRepository.getAllQuestionnaires).toHaveBeenCalledTimes(
      1
    );
  });

  it('should return only active questionnaires for STAGIAIRE', async () => {
    const questionnaires: Questionnaire[] = [
      {
        id: 1,
        name: 'React',
        description: 'Frontend',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: 'Docker',
        description: 'Backend',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    questionnaireRepository.getAllQuestionnaires.mockResolvedValueOnce(
      Ok.of(questionnaires)
    );

    const result = await getAllQuestionnairesUseCase.execute(stagiaireUser);

    expect(result).toEqual(
      Ok.of([
        {
          id: 1,
          name: 'React',
          description: 'Frontend',
          isActive: true,
          createdAt: questionnaires[0].createdAt,
          updatedAt: questionnaires[0].updatedAt,
        },
      ])
    );
    expect(questionnaireRepository.getAllQuestionnaires).toHaveBeenCalledTimes(
      1
    );
  });

  it('should return PermissionDeniedError for unauthorized role', async () => {
    const unknownUser = {
      ...stagiaireUser,
      roleId: 999 as RoleEnum,
      role: { id: 999, name: 'UNKNOWN', isActive: true },
    };

    questionnaireRepository.getAllQuestionnaires.mockResolvedValueOnce(
      Ok.of([])
    );

    const result = await getAllQuestionnairesUseCase.execute(unknownUser);

    expect(result).toEqual(
      Err.of(
        new PermissionDeniedError(
          'Rôle non autorisé à consulter les questionnaires'
        )
      )
    );
  });
});
