import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CreateUserUseCase } from '../../../usecases/user/createUserUseCase';
import { UserRepository } from '../../../interfaces/userRepository';
import { PasswordHasher } from '../../../providers/passwordHash';
import { User } from '../../../entities/user/user';
import {
  AlreadyExistError,
  PermissionDeniedError,
  ValidationError,
  NotFoundError,
} from '../../../errors/errors';
import { Err, Ok } from '../../../errors/result';
import { RoleEnum } from '../../../enums/roleEnums';
import { CreateUserCommand } from '../../../commands/user/userCommand';

describe('Feature: CreateUser', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let createUserUseCase: CreateUserUseCase;

  let currentUser: User;
  let newUser: User;

  beforeEach(() => {
    userRepository = {
      getUserByEmail: jest.fn(),
      getCurrentUser: jest.fn(),
      createUser: jest.fn(),
    };

    passwordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    createUserUseCase = new CreateUserUseCase(userRepository, passwordHasher);

    currentUser = {
      id: 1,
      login: 'admin',
      email: 'admin@test.com',
      password: 'AdminPass1!',
      firstName: 'Admin',
      lastName: 'User',
      company: 'QCMPlus',
      isActive: true,
      roleId: RoleEnum.ADMIN,
      role: { id: 1, name: 'ADMIN', isActive: true },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    newUser = {
      id: 0,
      login: 'testuser',
      email: 'user@test.com',
      password: 'StrongPass1!',
      firstName: 'Test',
      lastName: 'User',
      company: 'QCMPlus',
      isActive: true,
      roleId: RoleEnum.STAGIAIRE,
      role: { id: 2, name: 'STAGIAIRE', isActive: true },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    userRepository.getUserByEmail.mockResolvedValue(
      Err.of(new NotFoundError('Utilisateur non trouvé'))
    );
    userRepository.createUser.mockResolvedValue(Ok.of(undefined));
  });

  it('should return PermissionDeniedError if current user is not admin', async () => {
    currentUser.roleId = RoleEnum.STAGIAIRE;

    const command: CreateUserCommand = {
      currentUser: currentUser.roleId,
      newUser,
    };

    const result = await createUserUseCase.execute(command);

    expect(result).toEqual(
      Err.of(
        new PermissionDeniedError(
          'Vous n’avez pas les droits pour créer un utilisateur.'
        )
      )
    );
  });

  it('should return ValidationError if any required field is empty', async () => {
    newUser.login = '';

    const command: CreateUserCommand = {
      currentUser: currentUser.roleId,
      newUser,
    };

    const result = await createUserUseCase.execute(command);

    expect(result).toEqual(
      Err.of(new ValidationError('Tous les champs sont obligatoires'))
    );
  });

  it('should return ValidationError if email format is invalid', async () => {
    newUser.email = 'invalid-email';

    const command: CreateUserCommand = {
      currentUser: currentUser.roleId,
      newUser,
    };

    const result = await createUserUseCase.execute(command);

    expect(result).toEqual(Err.of(new ValidationError('Email invalide')));
  });

  it('should return ValidationError if password is too weak', async () => {
    newUser.password = 'weakpass';

    const command: CreateUserCommand = {
      currentUser: currentUser.roleId,
      newUser,
    };

    const result = await createUserUseCase.execute(command);

    expect(result).toEqual(
      Err.of(
        new ValidationError(
          'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
        )
      )
    );
  });

  it('should return AlreadyExistError if email already exists', async () => {
    userRepository.getUserByEmail.mockResolvedValueOnce(Ok.of(newUser));

    const command: CreateUserCommand = {
      currentUser: currentUser.roleId,
      newUser,
    };

    const result = await createUserUseCase.execute(command);

    expect(result).toEqual(
      Err.of(
        new AlreadyExistError(`L'email "${newUser.email}" est déjà utilisé.`)
      )
    );
  });

  it('should return Ok.of(undefined) if creation succeeds', async () => {
    const command: CreateUserCommand = {
      currentUser: currentUser.roleId,
      newUser,
    };

    const result = await createUserUseCase.execute(command);

    expect(result).toEqual(Ok.of(undefined));
    expect(userRepository.createUser).toHaveBeenCalledTimes(1);
  });
});
