import { Result } from '../errors/result';
import { AppError } from '../errors/appError';
import { Questionnaire } from '../entities/questionnaire/questionnaire';

export interface QuestionnaireRepository {
  getQuestionnaireByName(
    name: string
  ): Promise<Result<Questionnaire, AppError>>;
  getQuestionnaireById(id: number): Promise<Result<Questionnaire, AppError>>;
  createQuestionnaire(
    questionnaire: Questionnaire
  ): Promise<Result<void, AppError>>;
  getAllQuestionnaires(): Promise<Result<Questionnaire[], AppError>>;
}
