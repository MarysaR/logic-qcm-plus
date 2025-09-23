import { User } from '../entities/user/user';
import { RoleEnum } from '../enums/roleEnums';

export function hasRoles(user: User, required: RoleEnum): boolean {
  if (user.role.name == RoleEnum.ADMIN) {
    return true;
  }

  return user.role.name == required;
}
