import { User } from '../../entities/user/user';
import { RoleEnum } from '../../enums/roleEnums';

type UserBuilder = {
  withId: (id: number) => UserBuilder;
  withFirstName: (firstName: string) => UserBuilder;
  withLastName: (lastName: string) => UserBuilder;
  withLogin: (login: string) => UserBuilder;
  withEmail: (email: string) => UserBuilder;
  withPassword: (password: string) => UserBuilder;
  withCompany: (company: string) => UserBuilder;
  withRole: (role: RoleEnum) => UserBuilder;
  withCreatedAt: (date: Date) => UserBuilder;
  withUpdatedAt: (date: Date) => UserBuilder;
  inactive: () => UserBuilder;
  build: () => User;
};

export const userBuilder = ({
  id = 1,
  firstName = 'Test',
  lastName = 'User',
  login = 'testuser',
  email = 'test@example.com',
  password = 'hashed-secret',
  company,
  isActive = true,
  roleId = 2,
  role: roleValue = { id: 2, name: RoleEnum.STAGIAIRE, isActive: true },
  createdAt = new Date(),
  updatedAt = new Date(),
}: Partial<User> = {}): UserBuilder => {
  const props: User = {
    id,
    firstName,
    lastName,
    login,
    email,
    password,
    company,
    isActive,
    roleId,
    role: roleValue,
    createdAt,
    updatedAt,
  };

  return {
    withId: (id: number) => userBuilder({ ...props, id }),
    withFirstName: (firstName: string) => userBuilder({ ...props, firstName }),
    withLastName: (lastName: string) => userBuilder({ ...props, lastName }),
    withLogin: (login: string) => userBuilder({ ...props, login }),
    withEmail: (email: string) => userBuilder({ ...props, email }),
    withPassword: (password: string) => userBuilder({ ...props, password }),
    withCompany: (company: string) => userBuilder({ ...props, company }),
    withRole: (roleEnum: RoleEnum) =>
      userBuilder({
        ...props,
        roleId: roleEnum === RoleEnum.ADMIN ? 1 : 2,
        role: {
          id: roleEnum === RoleEnum.ADMIN ? 1 : 2,
          name: roleEnum,
          isActive: true,
        },
      }),
    withCreatedAt: (date: Date) => userBuilder({ ...props, createdAt: date }),
    withUpdatedAt: (date: Date) => userBuilder({ ...props, updatedAt: date }),
    inactive: () => userBuilder({ ...props, isActive: false }),
    build: (): User => props,
  };
};
