import { Answer } from '../../entities/answer/answer';

export interface UpdateQuestionCommand {
  questionId: number;
  questionnaireId: number;
  label: string;
  answers: Answer[];
  updatedAt: Date;
}
