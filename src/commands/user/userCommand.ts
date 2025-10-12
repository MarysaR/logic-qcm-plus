import { User } from '../../entities/user/user';

export interface CreateUserCommand {
  currentUser: number;
  newUser: User;
}
