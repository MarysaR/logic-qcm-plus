import { Role } from '../roles/role';

export interface User {
  id: number;
  login: string;
  email: string;
  password: string;
  isActive: boolean;
  roleId: number;
  role: Role;
}
