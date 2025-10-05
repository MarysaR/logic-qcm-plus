import { User } from '../entities/user/user';
import { RoleEnum } from '../enums/roleEnums';

export function hasRoles(user: User, required: RoleEnum): boolean {
  if (!user.roleId) return false;
  if (user.roleId == RoleEnum.ADMIN) return true;

  return user.roleId == required;
}
