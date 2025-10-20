import { jest } from '@jest/globals';
import { DeleteQuestionUseCase } from '../../../usecases/question/deleteQuestionUseCase';
import { QuestionRepository } from '../../../interfaces/questionRepository';
import { Err, Ok } from '../../../errors/result';
import {
  PermissionDeniedError,
  NotFoundError,
  TechnicalError,
} from '../../../errors/errors';
import { RoleEnum } from '../../../enums/roleEnums';
import { userBuilder } from '../../builders/user-builder';
import { User } from '../../../entities/user/user';

describe('Feature: DeleteQuestionUseCase', () => {
  let questionRepository: jest.Mocked<QuestionRepository>;
  let deleteQuestionUseCase: DeleteQuestionUseCase;
  let adminUser: User;
  let stagiaireUser: User;

  beforeEach(() => {
    questionRepository = {
      getQuestionsOfQuestionnaire: jest.fn(),
      getQuestionById: jest.fn(),
      createQuestion: jest.fn(),
      updateQuestion: jest.fn(),
      deleteQuestion: jest.fn(),
    };

    deleteQuestionUseCase = new DeleteQuestionUseCase(questionRepository);

    adminUser = userBuilder().withRole(RoleEnum.ADMIN).build();
    stagiaireUser = userBuilder().withRole(RoleEnum.STAGIAIRE).build();
  });

  it('should return PermissionDeniedError if current user is not ADMIN', async () => {
    const result = await deleteQuestionUseCase.execute(stagiaireUser, 1);

    expect(result).toEqual(
      Err.of(
        new PermissionDeniedError(
          'Seul un administrateur peut supprimer une question'
        )
      )
    );
    expect(questionRepository.deleteQuestion).not.toHaveBeenCalled();
  });

  it('should return NotFoundError if question does not exist', async () => {
    questionRepository.deleteQuestion.mockResolvedValueOnce(
      Err.of(new NotFoundError('Question introuvable'))
    );

    const result = await deleteQuestionUseCase.execute(adminUser, 99);

    expect(result).toEqual(Err.of(new NotFoundError('Question introuvable')));
    expect(questionRepository.deleteQuestion).toHaveBeenCalledWith(99);
  });

  it('should return TechnicalError if repository fails to delete question', async () => {
    questionRepository.deleteQuestion.mockResolvedValueOnce(
      Err.of(new TechnicalError('Erreur technique DB'))
    );

    const result = await deleteQuestionUseCase.execute(adminUser, 2);

    expect(result).toEqual(
      Err.of(
        new TechnicalError(
          'Erreur technique lors de la suppression de la question'
        )
      )
    );
    expect(questionRepository.deleteQuestion).toHaveBeenCalledWith(2);
  });

  it('should delete question successfully', async () => {
    questionRepository.deleteQuestion.mockResolvedValueOnce(Ok.of(undefined));

    const result = await deleteQuestionUseCase.execute(adminUser, 3);

    expect(result).toEqual(Ok.of(undefined));
    expect(questionRepository.deleteQuestion).toHaveBeenCalledWith(3);
  });
});
