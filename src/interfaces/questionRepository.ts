import { Result } from '../errors/result';
import { AppError } from '../errors/appError';
import { Question } from '../entities/question/question';
import { CreateQuestionCommand } from '../commands/question/createQuestionCommand';

export interface QuestionRepository {
  getQuestions(questionnaireId: number): Promise<Result<Question[], AppError>>;
  getQuestionById(id: number): Promise<Result<Question, AppError>>;
  createQuestion(
    command: CreateQuestionCommand
  ): Promise<Result<void, AppError>>;
}
