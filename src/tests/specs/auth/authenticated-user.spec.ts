import { jest } from '@jest/globals';
import { UserRepository } from '../../../interfaces/userRepository';
import { TokenProvider } from '../../../providers/tokenProvider';
import { AuthenticateUserUseCase } from '../../../usecases/auth/authenticateUserUseCase';
import { ValidationError } from '../../../errors/errors';
import { Err, Ok } from '../../../errors/result';
import { User } from '../../../entities/user/user';
import { PasswordHasher } from '../../../providers/passwordHash';
import { passwordHasherStub } from '../../stubs/passwordHashStubs';

describe('Feature: TokenProvider', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let tokenProvider: jest.Mocked<TokenProvider>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let authenticateUserUseCase: AuthenticateUserUseCase;

  beforeEach(() => {
    userRepository = {
      getUserByEmail: jest.fn(),
      getCurrentUser: jest.fn(),
      createUser: jest.fn(),
      getAllUsers: jest.fn(),
      updateUser: jest.fn(),
    };

    tokenProvider = {
      generate: jest.fn(),
      verify: jest.fn(),
    };

    passwordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    authenticateUserUseCase = new AuthenticateUserUseCase(
      userRepository,
      tokenProvider,
      passwordHasher
    );
  });

  it('should return ValidationError if email is empty', async () => {
    const result = await authenticateUserUseCase.execute({
      email: '',
      password: 'secret',
    });

    expect(result).toEqual(
      Err.of(new ValidationError("L'email est obligatoire"))
    );
  });

  it('should return ValidationError if password is empty', async () => {
    const result = await authenticateUserUseCase.execute({
      email: 'test@example.com',
      password: '',
    });

    expect(result).toEqual(
      Err.of(new ValidationError('Le mot de passe est obligatoire'))
    );
  });

  it('should return ValidationError if login and password are incorrect', async () => {
    const user: User = {
      id: 1,
      firstName: 'Test',
      lastName: 'User',
      login: 'testuser',
      email: 'test@example.com',
      password: 'hashed-secret',
      isActive: true,
      roleId: 2,
      role: {
        id: 2,
        name: 'STAGIAIRE',
        isActive: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    userRepository.getUserByEmail.mockResolvedValueOnce(Ok.of(user));
    passwordHasher.compare.mockResolvedValueOnce(false);

    const result = await authenticateUserUseCase.execute({
      email: 'test@example.com',
      password: 'wrong-password',
    });

    expect(result).toEqual(
      Err.of(new ValidationError('Identifiants incorrects'))
    );
  });

  it('should return Ok with a JWT if login and password are correct', async () => {
    const user: User = {
      id: 1,
      firstName: 'Test',
      lastName: 'User',
      login: 'testuser',
      email: 'test@example.com',
      password: 'hashed-secret',
      isActive: true,
      roleId: 2,
      role: {
        id: 2,
        name: 'STAGIAIRE',
        isActive: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    userRepository.getUserByEmail.mockResolvedValueOnce(Ok.of(user));
    tokenProvider.generate.mockResolvedValueOnce(Ok.of('jwt-token'));

    authenticateUserUseCase = new AuthenticateUserUseCase(
      userRepository,
      tokenProvider,
      passwordHasherStub()
    );

    const result = await authenticateUserUseCase.execute({
      email: 'test@example.com',
      password: 'secret',
    });

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toBe('jwt-token');
    }
  });

  it('should call tokenProvider.generate when authentication succeeds', async () => {
    const user: User = {
      id: 1,
      firstName: 'Test',
      lastName: 'User',
      login: 'testuser',
      email: 'test@example.com',
      password: 'hashed-secret',
      isActive: true,
      roleId: 2,
      role: {
        id: 2,
        name: 'STAGIAIRE',
        isActive: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    userRepository.getUserByEmail.mockResolvedValueOnce(Ok.of(user));
    tokenProvider.generate.mockResolvedValueOnce(Ok.of('jwt-token'));

    authenticateUserUseCase = new AuthenticateUserUseCase(
      userRepository,
      tokenProvider,
      passwordHasherStub()
    );

    const result = await authenticateUserUseCase.execute({
      email: 'test@example.com',
      password: 'secret',
    });

    expect(tokenProvider.generate).toHaveBeenCalledTimes(1);
    expect(tokenProvider.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: user.id,
        email: user.email,
        roleId: user.roleId,
      })
    );

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toBe('jwt-token');
    }
  });
});
