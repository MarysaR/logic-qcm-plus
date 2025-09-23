import { PasswordHasher } from '../../providers/passwordHash';

export function passwordHasherStub(): PasswordHasher {
  return {
    async hash(plain: string) {
      return `hashed-${plain}`;
    },
    async compare(plain: string, hash: string) {
      return hash == `hashed-${plain}`;
    },
  };
}
