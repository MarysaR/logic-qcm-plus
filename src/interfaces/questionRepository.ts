import { Result } from '../errors/result';
import { AppError } from '../errors/appError';
import { CreateQuestionCommand } from '../commands/question/createQuestionCommand';
import { Question } from '../entities/question/question';
import { UpdateQuestionCommand } from '../commands/question/updateQuestionCommand';

export interface QuestionRepository {
  getQuestionsOfQuestionnaire(
    questionnaireId: number
  ): Promise<Result<Question[], AppError>>;
  getQuestionById(id: number): Promise<Result<Question, AppError>>;
  createQuestion(
    command: CreateQuestionCommand
  ): Promise<Result<void, AppError>>;
  updateQuestion(
    command: UpdateQuestionCommand
  ): Promise<Result<Question, AppError>>;
  deleteQuestion(id: number): Promise<Result<void, AppError>>;
}
