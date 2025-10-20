import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { UpdateUserUseCase } from '../../../usecases/user/updateUserUseCase';
import { UserRepository } from '../../../interfaces/userRepository';
import { User } from '../../../entities/user/user';
import { RoleEnum } from '../../../enums/roleEnums';
import { Err, Ok } from '../../../errors/result';
import {
  PermissionDeniedError,
  TechnicalError,
  ValidationError,
} from '../../../errors/errors';

describe('Feature: UpdateUserUseCase', () => {
  let mockUserRepo: jest.Mocked<UserRepository>;
  let useCase: UpdateUserUseCase;
  let updatedUser: User;
  let adminUser: User;

  beforeEach(() => {
    mockUserRepo = {
      updateUser: jest.fn(),
      getUserByEmail: jest.fn(),
      getCurrentUser: jest.fn(),
      createUser: jest.fn(),
      getAllUsers: jest.fn(),
    };

    useCase = new UpdateUserUseCase(mockUserRepo);

    adminUser = {
      id: 1,
      firstName: 'Admin',
      lastName: 'User',
      login: 'admin',
      email: 'admin@example.com',
      password: 'hashed',
      company: 'Socomec',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      roleId: RoleEnum.ADMIN,
      role: {
        id: RoleEnum.ADMIN,
        name: 'Admin',
        description: 'Admin role',
        isActive: true,
      },
    };

    updatedUser = {
      id: 2,
      firstName: 'Updated',
      lastName: 'User',
      login: 'updatedUser',
      email: 'updated@example.com',
      password: 'newHashedPassword',
      company: 'Socomec',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      roleId: RoleEnum.STAGIAIRE,
      role: {
        id: RoleEnum.STAGIAIRE,
        name: 'Stagiaire',
        description: 'Stagiaire role',
        isActive: true,
      },
    };
  });

  it('should return PermissionDeniedError if current user is not admin', async () => {
    const nonAdminUser = { ...adminUser, roleId: RoleEnum.STAGIAIRE };

    const result = await useCase.execute(git , updatedUser);

    expect(result).toEqual(
      Err.of(
        new PermissionDeniedError(
          'Seul un administrateur peut modifier un questionnaire'
        )
      )
    );
    expect(mockUserRepo.updateUser).not.toHaveBeenCalled();
  });

  it('should return ValidationError if updated user has no ID', async () => {
    const invalidUser = { ...updatedUser, id: undefined as any };

    const result = await useCase.execute(adminUser, invalidUser);

    expect(result).toEqual(
      Err.of(new ValidationError('ID de l’utilisateur à modifier manquant'))
    );
    expect(mockUserRepo.updateUser).not.toHaveBeenCalled();
  });

  it('should return TechnicalError if repository fails', async () => {
    mockUserRepo.updateUser.mockResolvedValueOnce(
      Err.of(new TechnicalError('DB error'))
    );

    const result = await useCase.execute(adminUser, updatedUser);

    expect(result).toEqual(
      Err.of(
        new TechnicalError(
          'Erreur technique lors de la mise à jour de l’utilisateur'
        )
      )
    );
    expect(mockUserRepo.updateUser).toHaveBeenCalledWith(updatedUser);
  });

  it('should return Ok with updated user on success', async () => {
    mockUserRepo.updateUser.mockResolvedValueOnce(Ok.of(updatedUser));

    const result = await useCase.execute(adminUser, updatedUser);

    expect(result).toEqual(Ok.of(updatedUser));
    expect(mockUserRepo.updateUser).toHaveBeenCalledWith(updatedUser);
  });
});