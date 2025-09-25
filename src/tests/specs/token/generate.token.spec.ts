import { jest } from '@jest/globals';
import { GenerateTokenUseCase } from '../../../usecases/token/generateTokenUseCase';
import { TokenProvider } from '../../../providers/tokenProvider';
import { User } from '../../../entities/user/user';
import { RoleEnum } from '../../../enums/roleEnums';
import { Ok } from '../../../errors/result';

describe('Feature: GenerateTokenUseCase', () => {
  let tokenProvider: jest.Mocked<TokenProvider>;
  let generateTokenUseCase: GenerateTokenUseCase;
  let user: User;

  beforeEach(() => {
    tokenProvider = {
      generate: jest.fn(),
      verify: jest.fn(),
    };

    generateTokenUseCase = new GenerateTokenUseCase(tokenProvider);

    user = {
      id: 1,
      login: 'testuser',
      email: 'test@example.com',
      password: 'hashed-secret',
      isActive: true,
      roleId: 2,
      role: {
        id: 2,
        name: RoleEnum.STAGIAIRE,
        isActive: true,
      },
    };
  });

  it('should return Ok with a JWT when given a valid user', async () => {
    tokenProvider.generate.mockResolvedValueOnce(Ok.of('jwt-token'));

    const result = await generateTokenUseCase.execute(user);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toBe('jwt-token');
    }
  });
});
