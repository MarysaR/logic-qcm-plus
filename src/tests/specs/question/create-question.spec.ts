import { jest } from '@jest/globals';
import { CreateQuestionUseCase } from '../../../usecases/question/createQuestionUseCase';
import { QuestionRepository } from '../../../interfaces/questionRepository';
import { CreateQuestionCommand } from '../../../commands/question/createQuestionCommand';
import {
  PermissionDeniedError,
  TechnicalError,
  ValidationError,
} from '../../../errors/errors';
import { Err, Ok } from '../../../errors/result';
import { userBuilder } from '../../builders/user-builder';
import { RoleEnum } from '../../../enums/roleEnums';

describe('Feature: CreateQuestionUseCase', () => {
  let questionRepository: jest.Mocked<QuestionRepository>;
  let useCase: CreateQuestionUseCase;

  beforeEach(() => {
    questionRepository = {
      getQuestionsOfQuestionnaire: jest.fn(),
      getQuestionById: jest.fn(),
      createQuestion: jest.fn(),
      updateQuestion: jest.fn(),
    };

    useCase = new CreateQuestionUseCase(questionRepository);
  });

  it('should return PermissionDeniedError if current user is not ADMIN', async () => {
    const stagiaireUser = userBuilder().withRole(RoleEnum.STAGIAIRE).build();

    const command: CreateQuestionCommand = {
      label: 'Quelle est la capitale de la France ?',
      questionnaireId: 1,
      answers: [
        { text: 'Paris', isCorrect: true },
        { text: 'Lyon', isCorrect: false },
      ],
    };

    const result = await useCase.execute(stagiaireUser, command);

    expect(result).toEqual(
      Err.of(
        new PermissionDeniedError(
          'Seul un administrateur peut créer une question'
        )
      )
    );
    expect(questionRepository.createQuestion).not.toHaveBeenCalled();
  });

  it('should return ValidationError if less than 2 answers are provided', async () => {
    const adminUser = userBuilder().withRole(RoleEnum.ADMIN).build();

    const command: CreateQuestionCommand = {
      label: 'Quelle est la capitale de la France ?',
      questionnaireId: 1,
      answers: [{ text: 'Paris', isCorrect: true }],
    };

    const result = await useCase.execute(adminUser, command);

    expect(result).toEqual(
      Err.of(
        new ValidationError('Une question doit avoir entre 2 et 4 réponses')
      )
    );
    expect(questionRepository.createQuestion).not.toHaveBeenCalled();
  });

  it('should return ValidationError if no correct answer is provided', async () => {
    const adminUser = userBuilder().withRole(RoleEnum.ADMIN).build();

    const command: CreateQuestionCommand = {
      label: 'Quelles sont des langages de programmation ?',
      questionnaireId: 1,
      answers: [
        { text: 'Paris', isCorrect: false },
        { text: 'Lyon', isCorrect: false },
      ],
    };

    const result = await useCase.execute(adminUser, command);

    expect(result).toEqual(
      Err.of(
        new ValidationError(
          'Une question doit avoir au moins une réponse correcte'
        )
      )
    );
    expect(questionRepository.createQuestion).not.toHaveBeenCalled();
  });

  it('should return ValidationError if more than 4 answers are provided', async () => {
    const adminUser = userBuilder().withRole(RoleEnum.ADMIN).build();

    const command: CreateQuestionCommand = {
      label: 'Quelles sont des langages de programmation ?',
      questionnaireId: 1,
      answers: [
        { text: 'Java', isCorrect: true },
        { text: 'Python', isCorrect: true },
        { text: 'C#', isCorrect: false },
        { text: 'Ruby', isCorrect: false },
        { text: 'Paris', isCorrect: false },
      ],
    };

    const result = await useCase.execute(adminUser, command);

    expect(result).toEqual(
      Err.of(
        new ValidationError('Une question doit avoir entre 2 et 4 réponses')
      )
    );
    expect(questionRepository.createQuestion).not.toHaveBeenCalled();
  });

  it('should return ValidationError if an answer text is empty', async () => {
    const adminUser = userBuilder().withRole(RoleEnum.ADMIN).build();

    const command: CreateQuestionCommand = {
      label: 'Quelle est la capitale de la France ?',
      questionnaireId: 1,
      answers: [
        { text: '', isCorrect: true },
        { text: 'Lyon', isCorrect: false },
      ],
    };

    const result = await useCase.execute(adminUser, command);

    expect(result).toEqual(
      Err.of(
        new ValidationError("Le texte d'une réponse ne peut pas être vide")
      )
    );
    expect(questionRepository.createQuestion).not.toHaveBeenCalled();
  });

  it('should return TechnicalError if repository fails to create the question', async () => {
    const adminUser = userBuilder().withRole(RoleEnum.ADMIN).build();

    const command: CreateQuestionCommand = {
      label: 'Quelles sont des langages de programmation ?',
      questionnaireId: 1,
      answers: [
        { text: 'Java', isCorrect: true },
        { text: 'Python', isCorrect: false },
      ],
    };

    questionRepository.createQuestion.mockResolvedValueOnce(
      Err.of(new TechnicalError('DB error'))
    );

    const result = await useCase.execute(adminUser, command);

    expect(result).toEqual(
      Err.of(
        new TechnicalError(
          'Erreur technique lors de la création de la question'
        )
      )
    );
  });

  it('should create a question successfully', async () => {
    const adminUser = userBuilder().withRole(RoleEnum.ADMIN).build();

    const command: CreateQuestionCommand = {
      label: 'Quelle est la capitale de la France ?',
      questionnaireId: 1,
      answers: [
        { text: 'Paris', isCorrect: true },
        { text: 'Lyon', isCorrect: false },
      ],
    };

    questionRepository.createQuestion.mockResolvedValueOnce(Ok.of(undefined));

    const result = await useCase.execute(adminUser, command);

    expect(result).toEqual(Ok.of(undefined));
    expect(questionRepository.createQuestion).toHaveBeenCalledWith(command);
  });
});
