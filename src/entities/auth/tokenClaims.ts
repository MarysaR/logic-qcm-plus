export interface TokenClaims {
  userId: number;
  email: string;
  roleId: number;
  issuedAt: number;
  expiresAt: number;
}
