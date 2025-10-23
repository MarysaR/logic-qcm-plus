import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { GetAllUsersUseCase } from '../../../usecases/user/getAllUsersUseCase';
import { UserRepository } from '../../../interfaces/userRepository';
import { User } from '../../../entities/user/user';
import { RoleEnum } from '../../../enums/roleEnums';
import { Err, Ok } from '../../../errors/result';
import {
  PermissionDeniedError,
  TechnicalError,
  ValidationError,
} from '../../../errors/errors';

describe('Feature: GetAllUsers', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let getAllUsersUseCase: GetAllUsersUseCase;

  let adminUser: User;
  let stagiaireUser: User;

  beforeEach(() => {
    userRepository = {
      getAllUsers: jest.fn(),
      getUserByEmail: jest.fn(),
      getCurrentUser: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
    };

    getAllUsersUseCase = new GetAllUsersUseCase(userRepository);

    adminUser = {
      id: 1,
      login: 'admin',
      email: 'admin@test.com',
      password: 'fake-password',
      firstName: 'Admin',
      lastName: 'Bob',
      company: 'QCMPlus',
      isActive: true,
      roleId: RoleEnum.ADMIN,
      role: { id: 1, name: 'ADMIN', isActive: true },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    stagiaireUser = {
      id: 2,
      login: 'stagiaire',
      email: 'stagiaire@test.com',
      password: 'fake-password',
      firstName: 'Stagiaire',
      lastName: 'Lisa',
      company: 'QCMPlus',
      isActive: true,
      roleId: RoleEnum.STAGIAIRE,
      role: { id: 2, name: 'STAGIAIRE', isActive: true },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  it('should return ValidationError if current user is missing', async () => {
    const result = await getAllUsersUseCase.execute(null as unknown as User);

    expect(result).toEqual(
      Err.of(
        new ValidationError('Utilisateur courant manquant pour la récupération')
      )
    );
    expect(userRepository.getAllUsers).not.toHaveBeenCalled();
  });

  it('should return PermissionDeniedError if user is not ADMIN', async () => {
    const result = await getAllUsersUseCase.execute(stagiaireUser);

    expect(result).toEqual(
      Err.of(
        new PermissionDeniedError(
          'Seul un administrateur peut accéder à la liste des utilisateurs'
        )
      )
    );
    expect(userRepository.getAllUsers).not.toHaveBeenCalled();
  });

  it('should return TechnicalError if repository fails', async () => {
    userRepository.getAllUsers.mockResolvedValueOnce(
      Err.of(new TechnicalError('Erreur base de données'))
    );

    const result = await getAllUsersUseCase.execute(adminUser);

    expect(result).toEqual(
      Err.of(
        new TechnicalError(
          'Erreur technique lors de la récupération des utilisateurs'
        )
      )
    );
  });

  it('should return only STAGIAIRE users for ADMIN', async () => {
    const users: User[] = [
      stagiaireUser,
      {
        ...adminUser,
        id: 3,
        login: 'autre-admin',
        roleId: RoleEnum.ADMIN,
        role: { id: 1, name: 'ADMIN', isActive: true },
      },
    ];

    userRepository.getAllUsers.mockResolvedValueOnce(Ok.of(users));

    const result = await getAllUsersUseCase.execute(adminUser);

    expect(result).toEqual(Ok.of([stagiaireUser]));
    expect(userRepository.getAllUsers).toHaveBeenCalledTimes(1);
  });
});
