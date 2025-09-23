import { User } from '../entities/user/user';
import { AppError } from '../errors/appError';
import { Result } from '../errors/result';

export interface UserRepository {
  getUserByEmail(email: string): Promise<Result<User, AppError>>;
}
