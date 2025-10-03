export interface Answer {
  id?: number;
  text: string;
  isCorrect: boolean;
  questionId: number;
  createdAt: Date;
  updatedAt: Date;
}
