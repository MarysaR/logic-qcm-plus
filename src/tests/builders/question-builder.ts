import { Question } from '../../entities/question/question';
import { Answer } from '../../entities/answer/answer';

type QuestionBuilder = {
  withId: (id: number) => QuestionBuilder;
  withLabel: (label: string) => QuestionBuilder;
  withQuestionnaireId: (id: number) => QuestionBuilder;
  withAnswers: (answers: Answer[]) => QuestionBuilder;
  withCreatedAt: (date: Date) => QuestionBuilder;
  withUpdatedAt: (date: Date) => QuestionBuilder;
  build: () => Question;
};

export const questionBuilder = ({
  id = 1,
  label = 'Question de test',
  questionnaireId = 1,
  answers = [
    {
      id: 1,
      text: 'Réponse A',
      isCorrect: true,
      questionId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      text: 'Réponse B',
      isCorrect: false,
      questionId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  createdAt = new Date(),
  updatedAt = new Date(),
}: Partial<Question> = {}): QuestionBuilder => {
  const props: Question = {
    id,
    label,
    questionnaireId,
    answers,
    createdAt,
    updatedAt,
  };

  return {
    withId: (id: number) => questionBuilder({ ...props, id }),
    withLabel: (label: string) => questionBuilder({ ...props, label }),
    withQuestionnaireId: (id: number) =>
      questionBuilder({ ...props, questionnaireId: id }),
    withAnswers: (answers: Answer[]) => questionBuilder({ ...props, answers }),
    withCreatedAt: (date: Date) =>
      questionBuilder({ ...props, createdAt: date }),
    withUpdatedAt: (date: Date) =>
      questionBuilder({ ...props, updatedAt: date }),
    build: (): Question => props,
  };
};
