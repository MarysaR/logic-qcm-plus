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

describe('UpdateUserUseCase', () => {
const mockUserRepo: jest.Mocked<UserRepository> = {
    updateUser: jest.fn(),
    getUserByEmail: jest.fn(),
    getCurrentUser: jest.fn(),
    createUser: jest.fn(),
    getAllUsers: jest.fn(),
};

  const adminUser: User = {
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

  const updatedUserData = {
    id: 2,
    firstName: 'Updated',
    lastName: 'User',
    email: 'updated@example.com',
  };

it('should return ValidationError if currentUser is missing', async () => {
    const useCase = new UpdateUserUseCase(mockUserRepo);
    const result = await useCase.execute(undefined as any, updatedUserData);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
        expect(result.error).toBeInstanceOf(ValidationError);
    }
});

  it('should return PermissionDeniedError if currentUser is not admin', async () => {
    const nonAdminUser = { ...adminUser, roleId: RoleEnum.STAGIAIRE };
    const useCase = new UpdateUserUseCase(mockUserRepo);
    const result = await useCase.execute(nonAdminUser, updatedUserData);

    expect(result.isErr()).toBe(true);
    expect(result.isErr).toBeInstanceOf(PermissionDeniedError);
  });

  it('should return ValidationError if updatedUser.id is missing', async () => {
    const useCase = new UpdateUserUseCase(mockUserRepo);
    const result = await useCase.execute(adminUser, { email: 'test@test.fr' });

    expect(result.isErr()).toBe(true);
    expect(result.isErr).toBeInstanceOf(ValidationError);
  });

  it('should return TechnicalError if repository fails', async () => {
    mockUserRepo.updateUser.mockResolvedValueOnce(Err.of(new TechnicalError('fail')));
    const useCase = new UpdateUserUseCase(mockUserRepo);
    const result = await useCase.execute(adminUser, updatedUserData);

    expect(result.isErr()).toBe(true);
    expect(result.isErr).toBeInstanceOf(TechnicalError);
  });

it('should return Ok with updated user on success', async () => {
    const updatedUser: User = {
        ...adminUser,
        ...updatedUserData,
    };

    mockUserRepo.updateUser.mockResolvedValueOnce(Ok.of(updatedUser));
    const useCase = new UpdateUserUseCase(mockUserRepo);
    const result = await useCase.execute(adminUser, updatedUserData);

    expect(result.isOk()).toBe(true);
    expect(result).toEqual(updatedUser);
});
});