import { jest } from '@jest/globals';
import { GetQuestionsOfQuestionnaireUseCase } from '../../../usecases/question/getQuestionsOfQuestionnaireUseCase';
import { QuestionRepository } from '../../../interfaces/questionRepository';
import { userBuilder } from '../../builders/user-builder';
import { RoleEnum } from '../../../enums/roleEnums';
import { Err, Ok } from '../../../errors/result';
import {
  NotFoundError,
  PermissionDeniedError,
  ValidationError,
} from '../../../errors/errors';
import { Question } from '../../../entities/question/question';

describe('Feature: GetQuestionsOfQuestionnaireUseCase', () => {
  let questionRepository: jest.Mocked<QuestionRepository>;
  let useCase: GetQuestionsOfQuestionnaireUseCase;

  beforeEach(() => {
    questionRepository = {
      createQuestion: jest.fn(),
      getQuestionsOfQuestionnaire: jest.fn(),
    };

    useCase = new GetQuestionsOfQuestionnaireUseCase(questionRepository);
  });

  it('should return PermissionDeniedError if current user is not ADMIN', async () => {
    const stagiaireUser = userBuilder().withRole(RoleEnum.STAGIAIRE).build();

    const result = await useCase.execute(stagiaireUser, 1);

    expect(result).toEqual(
      Err.of(
        new PermissionDeniedError(
          'Seul un administrateur peut consulter les questions d’un questionnaire'
        )
      )
    );
    expect(
      questionRepository.getQuestionsOfQuestionnaire
    ).not.toHaveBeenCalled();
  });

  it('should return ValidationError if questionnaireId is invalid', async () => {
    const adminUser = userBuilder().withRole(RoleEnum.ADMIN).build();

    const result = await useCase.execute(adminUser, 0);

    expect(result).toEqual(
      Err.of(new ValidationError('Identifiant de questionnaire invalide'))
    );
    expect(
      questionRepository.getQuestionsOfQuestionnaire
    ).not.toHaveBeenCalled();
  });

  it('should return NotFoundError if no questions are found for the given questionnaire', async () => {
    const adminUser = userBuilder().withRole(RoleEnum.ADMIN).build();

    questionRepository.getQuestionsOfQuestionnaire.mockResolvedValueOnce(
      Err.of(new NotFoundError('Aucune question trouvée'))
    );

    const result = await useCase.execute(adminUser, 1);

    expect(result).toEqual(
      Err.of(new NotFoundError('Aucune question trouvée pour ce questionnaire'))
    );
    expect(questionRepository.getQuestionsOfQuestionnaire).toHaveBeenCalledWith(
      1
    );
  });

  it('should return is successfully', async () => {
    const adminUser = userBuilder().withRole(RoleEnum.ADMIN).build();

    const questions: Question[] = [
      {
        id: 1,
        label: 'Quelle est la capitale de la France ?',
        questionnaireId: 1,
        answers: [
          {
            id: 1,
            text: 'Paris',
            isCorrect: true,
            questionId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 2,
            text: 'Lyon',
            isCorrect: false,
            questionId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        label: 'Quelle est la capitale de l’Espagne ?',
        questionnaireId: 1,
        answers: [
          {
            id: 3,
            text: 'Madrid',
            isCorrect: true,
            questionId: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 4,
            text: 'Barcelone',
            isCorrect: false,
            questionId: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    questionRepository.getQuestionsOfQuestionnaire.mockResolvedValueOnce(
      Ok.of(questions)
    );

    const result = await useCase.execute(adminUser, 1);

    expect(result).toEqual(Ok.of(questions));
    expect(questionRepository.getQuestionsOfQuestionnaire).toHaveBeenCalledWith(
      1
    );
  });
});
