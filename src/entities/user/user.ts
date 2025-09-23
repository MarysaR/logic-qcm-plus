export interface User {
  id: number;
  login: string;
  password: string;
  email: string;
  isActive: boolean;
  roleId: number;
}
