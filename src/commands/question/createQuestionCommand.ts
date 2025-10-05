import { CreateAnswerCommand } from './createAnswerCommand';

export interface CreateQuestionCommand {
  label: string;
  questionnaireId: number;
  answers: CreateAnswerCommand[];
}
