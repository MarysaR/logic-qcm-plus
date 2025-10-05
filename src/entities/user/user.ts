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
  company: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}
