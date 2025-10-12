import { Questionnaire } from '../../entities/questionnaire/questionnaire';

type QuestionnaireBuilder = {
  withId: (id: number) => QuestionnaireBuilder;
  withName: (name: string) => QuestionnaireBuilder;
  withDescription: (description: string) => QuestionnaireBuilder;
  inactive: () => QuestionnaireBuilder;
  withCreatedAt: (date: Date) => QuestionnaireBuilder;
  withUpdatedAt: (date: Date) => QuestionnaireBuilder;
  build: () => Questionnaire;
};

export const questionnaireBuilder = ({
  id = 1,
  name = 'Questionnaire test',
  description = 'Description du questionnaire de test',
  isActive = true,
  createdAt = new Date(),
  updatedAt = new Date(),
}: Partial<Questionnaire> = {}): QuestionnaireBuilder => {
  const props: Questionnaire = {
    id,
    name,
    description,
    isActive,
    createdAt,
    updatedAt,
  };

  return {
    withId: (id: number) => questionnaireBuilder({ ...props, id }),
    withName: (name: string) => questionnaireBuilder({ ...props, name }),
    withDescription: (description: string) =>
      questionnaireBuilder({ ...props, description }),
    inactive: () => questionnaireBuilder({ ...props, isActive: false }),
    withCreatedAt: (date: Date) =>
      questionnaireBuilder({ ...props, createdAt: date }),
    withUpdatedAt: (date: Date) =>
      questionnaireBuilder({ ...props, updatedAt: date }),
    build: (): Questionnaire => props,
  };
};
