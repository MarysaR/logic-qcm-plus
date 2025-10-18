import { Answer } from '../../entities/answer/answer';

type AnswerBuilder = {
  withId: (id: number) => AnswerBuilder;
  withText: (text: string) => AnswerBuilder;
  correct: () => AnswerBuilder;
  incorrect: () => AnswerBuilder;
  withQuestionId: (id: number) => AnswerBuilder;
  withCreatedAt: (date: Date) => AnswerBuilder;
  withUpdatedAt: (date: Date) => AnswerBuilder;
  build: () => Answer;
};

export const answerBuilder = ({
  id = 1,
  text = 'Réponse de test',
  isCorrect = false,
  questionId = 1,
  createdAt = new Date(),
  updatedAt = new Date(),
}: Partial<Answer> = {}): AnswerBuilder => {
  const props: Answer = {
    id,
    text,
    isCorrect,
    questionId,
    createdAt,
    updatedAt,
  };

  return {
    withId: (id: number) => answerBuilder({ ...props, id }),
    withText: (text: string) => answerBuilder({ ...props, text }),
    correct: () => answerBuilder({ ...props, isCorrect: true }),
    incorrect: () => answerBuilder({ ...props, isCorrect: false }),
    withQuestionId: (id: number) => answerBuilder({ ...props, questionId: id }),
    withCreatedAt: (date: Date) => answerBuilder({ ...props, createdAt: date }),
    withUpdatedAt: (date: Date) => answerBuilder({ ...props, updatedAt: date }),
    build: (): Answer => props,
  };
};
