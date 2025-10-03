import { Result } from '../errors/result';
import { AppError } from '../errors/appError';
import { Question } from '../entities/question/question';

export interface QuestionRepository {
  getQuestions(questionnaireId: number): Promise<Result<Question[], AppError>>;
  getQuestionById(id: number): Promise<Result<Question, AppError>>;
  createQuestion(question: Question): Promise<Result<void, AppError>>;
  updateQuestion(question: Question): Promise<Result<void, AppError>>;
  deleteQuestion(id: number): Promise<Result<void, AppError>>;
}
