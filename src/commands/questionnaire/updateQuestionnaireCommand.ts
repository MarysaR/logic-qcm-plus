export interface UpdateQuestionnaireCommand {
  id: number;
  name?: string;
  description?: string;
  isActive?: boolean;
  updatedAt: Date;
}
