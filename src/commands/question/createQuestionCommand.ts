import { Answer } from '../../entities/answer/answer';

export interface CreateQuestionCommand {
  label: string;
  questionnaireId: number;
  answers: Answer[];
}
