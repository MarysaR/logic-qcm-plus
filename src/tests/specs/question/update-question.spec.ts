import { jest } from '@jest/globals';
import { UpdateQuestionUseCase } from '../../../usecases/question/updateQuestionUseCase';
import { QuestionRepository } from '../../../interfaces/questionRepository';
import { Err, Ok } from '../../../errors/result';
import {
  PermissionDeniedError,
  TechnicalError,
  ValidationError,
} from '../../../errors/errors';
import { RoleEnum } from '../../../enums/roleEnums';
import { userBuilder } from '../../builders/user-builder';
import { questionBuilder } from '../../builders/question-builder';
import { UpdateQuestionCommand } from '../../../commands/question/updateQuestionCommand';
import { User } from '../../../entities/user/user';

describe('Feature: UpdateQuestionUseCase', () => {
  let questionRepository: jest.Mocked<QuestionRepository>;
  let updateQuestionUseCase: UpdateQuestionUseCase;
  let stagiaireUser: User;
  let adminUser: User;
  let command: UpdateQuestionCommand;

  beforeEach(() => {
    questionRepository = {
      getQuestionsOfQuestionnaire: jest.fn(),
      getQuestionById: jest.fn(),
      createQuestion: jest.fn(),
      updateQuestion: jest.fn(),
    };

    updateQuestionUseCase = new UpdateQuestionUseCase(questionRepository);

    adminUser = userBuilder().withRole(RoleEnum.ADMIN).build();
    stagiaireUser = userBuilder().withRole(RoleEnum.STAGIAIRE).build();

    const question = questionBuilder().build();
    command = {
      questionId: question.id!,
      questionnaireId: question.questionnaireId,
      label: question.label,
      answers: question.answers,
      updatedAt: new Date(),
    };
  });

  it('should return PermissionDeniedError if current user is not ADMIN', async () => {
    const result = await updateQuestionUseCase.execute(stagiaireUser, command);

    expect(result).toEqual(
      Err.of(
        new PermissionDeniedError(
          'Seul un administrateur peut modifier une question'
        )
      )
    );
    expect(questionRepository.updateQuestion).not.toHaveBeenCalled();
  });

  it('should return ValidationError if label is empty', async () => {
    command.label = '';

    const result = await updateQuestionUseCase.execute(adminUser, command);

    expect(result).toEqual(
      Err.of(new ValidationError('Le titre de la question est obligatoire'))
    );
    expect(questionRepository.updateQuestion).not.toHaveBeenCalled();
  });

  it('should return ValidationError if number of answers is not between 1 and 4', async () => {
    command.answers = [];

    let result = await updateQuestionUseCase.execute(adminUser, command);

    expect(result).toEqual(
      Err.of(
        new ValidationError('Une question doit avoir entre 1 et 4 réponses')
      )
    );
    expect(questionRepository.updateQuestion).not.toHaveBeenCalled();

    const baseAnswers = questionBuilder().build().answers;

    command.answers = [
      ...baseAnswers,
      { ...baseAnswers[0], id: 3 },
      { ...baseAnswers[0], id: 4 },
      { ...baseAnswers[0], id: 5 },
    ];

    result = await updateQuestionUseCase.execute(adminUser, command);

    expect(result).toEqual(
      Err.of(
        new ValidationError('Une question doit avoir entre 1 et 4 réponses')
      )
    );
    expect(questionRepository.updateQuestion).not.toHaveBeenCalled();
  });

  it('should return ValidationError if an answer text is empty', async () => {
    command.answers[0].text = '';

    const result = await updateQuestionUseCase.execute(adminUser, command);

    expect(result).toEqual(
      Err.of(
        new ValidationError("Le texte d'une réponse ne peut pas être vide")
      )
    );
    expect(questionRepository.updateQuestion).not.toHaveBeenCalled();
  });

  it('should return TechnicalError if repository fails to update the question', async () => {
    questionRepository.updateQuestion.mockResolvedValueOnce(
      Err.of(new TechnicalError('DB error'))
    );

    const result = await updateQuestionUseCase.execute(adminUser, command);

    expect(result).toEqual(
      Err.of(
        new TechnicalError(
          'Erreur technique lors de la mise à jour de la question'
        )
      )
    );
    expect(questionRepository.updateQuestion).toHaveBeenCalledWith(command);
  });

  it('should update question successfully', async () => {
    const updatedQuestion = questionBuilder()
      .withLabel('Question mise à jour')
      .build();

    questionRepository.updateQuestion.mockResolvedValueOnce(
      Ok.of(updatedQuestion)
    );

    const result = await updateQuestionUseCase.execute(adminUser, command);

    expect(result).toEqual(Ok.of(updatedQuestion));
    expect(questionRepository.updateQuestion).toHaveBeenCalledWith(command);
  });
});
