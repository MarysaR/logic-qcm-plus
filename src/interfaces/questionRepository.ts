import { Result } from '../errors/result';
import { AppError } from '../errors/appError';
import { CreateQuestionCommand } from '../commands/question/createQuestionCommand';
import { Question } from '../entities/question/question';

export interface QuestionRepository {
  getQuestionsOfQuestionnaire(
    questionnaireId: number
  ): Promise<Result<Question[], AppError>>;
  createQuestion(
    command: CreateQuestionCommand
  ): Promise<Result<void, AppError>>;
}
