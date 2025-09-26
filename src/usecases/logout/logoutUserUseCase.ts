/* eslint-disable @typescript-eslint/no-unused-vars */
import { Result, Ok } from '../../errors/result';
import { AppError } from '../../errors/appError';

export class LogoutUserUseCase {
  async execute(_token: string): Promise<Result<void, AppError>> {
    return Ok.of(undefined);
  }
}
