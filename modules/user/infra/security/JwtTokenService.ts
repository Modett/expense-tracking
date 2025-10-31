import jwt from "jsonwebtoken";
import type { ITokenService, TokenPayload } from "../../application/services/TokenService.js";

export interface JwtConfig {
  secret: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
}

export class JwtTokenService implements ITokenService {
  constructor(private readonly config: JwtConfig) {}

  async generateAccessToken(payload: TokenPayload): Promise<string> {
    const token = jwt.sign(
      { ...payload } as object,
      this.config.secret as jwt.Secret,
      { expiresIn: this.config.accessTokenExpiry } as jwt.SignOptions
    );
    return token;
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, this.config.secret) as TokenPayload;
      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired access token");
    }
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const token = jwt.sign(
      { userId } as object,
      this.config.secret as jwt.Secret,
      { expiresIn: this.config.refreshTokenExpiry } as jwt.SignOptions
    );
    return token;
  }

  async verifyRefreshToken(token: string): Promise<{ userId: string }> {
    try {
      const decoded = jwt.verify(token, this.config.secret) as { userId: string };
      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }
  }
}

