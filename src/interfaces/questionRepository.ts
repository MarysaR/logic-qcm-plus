import { Result } from '../errors/result';
import { AppError } from '../errors/appError';
import { CreateQuestionCommand } from '../commands/question/createQuestionCommand';

export interface QuestionRepository {
  createQuestion(
    command: CreateQuestionCommand
  ): Promise<Result<void, AppError>>;
}
