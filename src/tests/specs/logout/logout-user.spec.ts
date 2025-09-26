import { LogoutUserUseCase } from '../../../usecases/logout/logoutUserUseCase';
import { Ok } from '../../../errors/result';

describe('Feature: LogoutUser', () => {
  let logoutUserUseCase: LogoutUserUseCase;

  beforeEach(() => {
    logoutUserUseCase = new LogoutUserUseCase();
  });

  it('should return Ok when logout is called', async () => {
    const result = await logoutUserUseCase.execute('fake-jwt-token');

    expect(result).toEqual(Ok.of(undefined));
  });
});
