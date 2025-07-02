import { Ok, Result } from '../types/result';

/**
 * Use case minimal de test : Ping
 * Retourne "pong" sous forme de Result<string, never>
 */
export class PingUseCase {
  execute(): Result<string, never> {
    return Ok.of('pong');
  }
}
