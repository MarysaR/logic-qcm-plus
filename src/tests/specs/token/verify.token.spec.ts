import { jest } from '@jest/globals';
import { VerifyTokenUseCase } from '../../../usecases/token/verifyTokenUseCase';
import { TokenProvider } from '../../../providers/tokenProvider';
import { Err, Ok } from '../../../errors/result';
import { PermissionDeniedError } from '../../../errors/errors';
import { TokenClaims } from '../../../entities/auth/tokenClaims';

describe('Feature: VerifyTokenUseCase', () => {
  let tokenProvider: jest.Mocked<TokenProvider>;
  let verifyTokenUseCase: VerifyTokenUseCase;

  beforeEach(() => {
    tokenProvider = {
      generate: jest.fn(),
      verify: jest.fn(),
    };

    verifyTokenUseCase = new VerifyTokenUseCase(tokenProvider);
  });

  it('should return PermissionDeniedError if token is invalid', async () => {
    tokenProvider.verify.mockResolvedValueOnce(
      Err.of(new PermissionDeniedError('Token invalide'))
    );

    const result = await verifyTokenUseCase.execute('invalid.token');

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(PermissionDeniedError);
      expect(result.error.message).toBe('Token invalide');
    }
  });

  it('should return Ok with claims if token is valid', async () => {
    const claims: TokenClaims = {
      userId: 1,
      email: 'test@example.com',
      roleId: 2,
      issuedAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    tokenProvider.verify.mockResolvedValueOnce(Ok.of(claims));

    const result = await verifyTokenUseCase.execute('valid.token');

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toEqual(claims);
    }
  });
});
