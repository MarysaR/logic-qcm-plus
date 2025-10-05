import { Answer } from '../answer/answer';

export interface Question {
  id?: number;
  label: string;
  questionnaireId: number;
  answers: Answer[];
  createdAt?: Date;
  updatedAt?: Date;
}
