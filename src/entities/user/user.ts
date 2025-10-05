import { Role } from '../roles/role';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  login: string;
  email: string;
  password: string;
  company?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  roleId: number;
  role: Role;
}
