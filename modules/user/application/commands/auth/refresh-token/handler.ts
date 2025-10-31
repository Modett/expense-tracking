import type { IUserQueryRepository } from "../../../../domain/repositories/IUserQueryRepository.js";
import type { ITokenService, TokenPayload } from "../../../services/TokenService.js";
import { UserId } from "../../../../domain/value-objects/index.js";
import { RefreshTokenCommand } from "./command.js";

export interface RefreshTokenResponse {
  accessToken: string;
}

export class RefreshTokenCommandHandler {
  constructor(
    private readonly userQueryRepository: IUserQueryRepository,
    private readonly tokenService: ITokenService
  ) {}

  async handle(command: RefreshTokenCommand): Promise<RefreshTokenResponse> {
    const payload = await this.tokenService.verifyRefreshToken(command.refreshToken);
    const userId = UserId.fromString(payload.userId);
    const user = await this.userQueryRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.canLogin()) {
      throw new Error("Account is not active");
    }

    const tokenPayload: TokenPayload = {
      userId: user.id.getValue(),
      email: user.email.getValue(),
      role: user.role.toString(),
    };

    const accessToken = await this.tokenService.generateAccessToken(tokenPayload);

    return { accessToken };
  }
}
