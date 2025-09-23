import { TokenClaims } from '../../entities/auth/tokenClaims';

type TokenBuilder = {
  withUserId: (userId: number) => TokenBuilder;
  withEmail: (email: string) => TokenBuilder;
  withRoleId: (roleId: number) => TokenBuilder;
  withIssuedAt: (issuedAt: number) => TokenBuilder;
  withExpiresAt: (expiresAt: number) => TokenBuilder;
  build: () => TokenClaims;
};

export const tokenBuilder = ({
  userId = 1,
  email = 'test@example.com',
  roleId = 2,
  issuedAt = new Date().getTime(),
  expiresAt = new Date().getTime() + 5 * 60 * 1000, // 5 minutes
}: Partial<TokenClaims> = {}): TokenBuilder => {
  const props = { userId, email, roleId, issuedAt, expiresAt };

  return {
    withUserId: (userId: number) => tokenBuilder({ ...props, userId }),
    withEmail: (email: string) => tokenBuilder({ ...props, email }),
    withRoleId: (roleId: number) => tokenBuilder({ ...props, roleId }),
    withIssuedAt: (issuedAt: number) =>
      tokenBuilder({
        ...props,
        issuedAt,
        expiresAt: issuedAt + 5 * 60 * 1000, // recalcul expiration
      }),
    withExpiresAt: (expiresAt: number) => tokenBuilder({ ...props, expiresAt }),
    build: (): TokenClaims => ({
      userId: props.userId,
      email: props.email,
      roleId: props.roleId,
      issuedAt: props.issuedAt,
      expiresAt: props.expiresAt,
    }),
  };
};
