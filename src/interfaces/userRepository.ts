import { User } from '../entities/user/user';
import { AppError } from '../errors/appError';
import { Result } from '../errors/result';

export interface UserRepository {
  getUserByEmail(email: string): Promise<Result<User, AppError>>;
  getCurrentUser(userEmail: string): Promise<Result<User, AppError>>;
  createUser(user: User): Promise<Result<void, AppError>>;
}
