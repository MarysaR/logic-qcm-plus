import { jest } from '@jest/globals';
import { UserRepository } from '../../../interfaces/userRepository';
import { GetCurrentUserUseCase } from '../../../usecases/auth/getCurrentUserUseCase';
import { NotFoundError } from '../../../errors/errors';
import { Err, Ok } from '../../../errors/result';
import { TokenClaims } from '../../../entities/auth/tokenClaims';
import { User } from '../../../entities/user/user';

describe('Feature: GetCurrentUser', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let getCurrentUserUseCase: GetCurrentUserUseCase;

  beforeEach(() => {
    userRepository = {
      getUserByEmail: jest.fn(),
      getCurrentUser: jest.fn(),
      createUser: jest.fn(),
      getAllUsers: jest.fn(),
    };

    getCurrentUserUseCase = new GetCurrentUserUseCase(userRepository);
  });

  it('should return NotFoundError if user is not found', async () => {
    const claims: TokenClaims = {
      userId: 999,
      email: 'ghost@test.com',
      roleId: 2,
      issuedAt: Date.now(),
      expiresAt: Date.now() + 60000,
    };

    userRepository.getCurrentUser.mockResolvedValueOnce(
      Err.of(new NotFoundError('Utilisateur introuvable'))
    );

    const result = await getCurrentUserUseCase.execute(claims);

    expect(result).toEqual(
      Err.of(new NotFoundError('Utilisateur introuvable'))
    );
  });

  it('should return Ok with the current user if found', async () => {
    const claims: TokenClaims = {
      userId: 1,
      email: 'test@example.com',
      roleId: 2,
      issuedAt: Date.now(),
      expiresAt: Date.now() + 60000,
    };

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

    userRepository.getCurrentUser.mockResolvedValueOnce(Ok.of(user));

    const result = await getCurrentUserUseCase.execute(claims);

    expect(result).toEqual(Ok.of(user));
  });
});
