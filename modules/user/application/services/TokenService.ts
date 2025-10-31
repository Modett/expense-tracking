export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface ITokenService {
  generateAccessToken(payload: TokenPayload): Promise<string>;
  verifyAccessToken(token: string): Promise<TokenPayload>;
  generateRefreshToken(userId: string): Promise<string>;
  verifyRefreshToken(token: string): Promise<{ userId: string }>;
}
