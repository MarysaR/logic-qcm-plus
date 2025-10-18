import { jest } from '@jest/globals';
import { GetQuestionByIdUseCase } from '../../../usecases/question/getQuestionByIdUseCase';
import { QuestionRepository } from '../../../interfaces/questionRepository';
import { RoleEnum } from '../../../enums/roleEnums';
import { userBuilder } from '../../builders/user-builder';
import { questionBuilder } from '../../builders/question-builder';
import { Err, Ok } from '../../../errors/result';
import {
  PermissionDeniedError,
  NotFoundError,
  TechnicalError,
} from '../../../errors/errors';
import { Question } from '../../../entities/question/question';

describe('Feature: GetQuestionByIdUseCase', () => {
  let questionRepository: jest.Mocked<QuestionRepository>;
  let getQuestionByIdUseCase: GetQuestionByIdUseCase;
  let adminUser = userBuilder().withRole(RoleEnum.ADMIN).build();
  let stagiaireUser = userBuilder().withRole(RoleEnum.STAGIAIRE).build();
  let question: Question;

  beforeEach(() => {
    questionRepository = {
      getQuestionsOfQuestionnaire: jest.fn(),
      getQuestionById: jest.fn(),
      createQuestion: jest.fn(),
      updateQuestion: jest.fn(),
    };

    getQuestionByIdUseCase = new GetQuestionByIdUseCase(questionRepository);

    question = questionBuilder().withId(1).build();
  });

  it('should return PermissionDeniedError if current user is not ADMIN', async () => {
    const result = await getQuestionByIdUseCase.execute(stagiaireUser, 1);

    expect(result).toEqual(
      Err.of(
        new PermissionDeniedError(
          'Seul un administrateur peut consulter une question'
        )
      )
    );
    expect(questionRepository.getQuestionById).not.toHaveBeenCalled();
  });

  it('should return NotFoundError if question does not exist', async () => {
    questionRepository.getQuestionById.mockResolvedValueOnce(
      Err.of(new NotFoundError('Question introuvable'))
    );

    const result = await getQuestionByIdUseCase.execute(adminUser, 999);

    expect(result).toEqual(Err.of(new NotFoundError('Question introuvable')));
    expect(questionRepository.getQuestionById).toHaveBeenCalledWith(999);
  });

  it('should return TechnicalError if repository fails', async () => {
    questionRepository.getQuestionById.mockResolvedValueOnce(
      Err.of(new TechnicalError('Erreur Prisma'))
    );

    const result = await getQuestionByIdUseCase.execute(adminUser, 1);

    expect(result).toEqual(
      Err.of(
        new TechnicalError(
          'Erreur technique lors de la récupération de la question'
        )
      )
    );
    expect(questionRepository.getQuestionById).toHaveBeenCalledWith(1);
  });

  it('should return Ok.of(question) if question is found', async () => {
    questionRepository.getQuestionById.mockResolvedValueOnce(Ok.of(question));

    const result = await getQuestionByIdUseCase.execute(adminUser, 1);

    expect(result).toEqual(Ok.of(question));
    expect(questionRepository.getQuestionById).toHaveBeenCalledWith(1);
  });
});
