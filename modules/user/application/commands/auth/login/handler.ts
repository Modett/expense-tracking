import type { IUserQueryRepository } from "../../../../domain/repositories/IUserQueryRepository.js";
import type { IPasswordHasher } from "../../../services/PasswordHasher.js";
import type { ITokenService, TokenPayload } from "../../../services/TokenService.js";
import { User } from "../../../../domain/entities/User.js";
import { Email } from "../../../../domain/value-objects/index.js";
import { LoginCommand } from "./command.js";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export class LoginCommandHandler {
  constructor(
    private readonly userQueryRepository: IUserQueryRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService
  ) {}

  async handle(command: LoginCommand): Promise<AuthResponse> {
    const email = Email.create(command.email);
    const user = await this.userQueryRepository.findByEmail(email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (!user.canLogin()) {
      throw new Error("Account is not active");
    }

    const isValidPassword = await this.passwordHasher.verify(
      command.password,
      user.password.getValue()
    );

    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    return this.generateAuthResponse(user);
  }

  private createTokenPayload(user: User): TokenPayload {
    return {
      userId: user.id.getValue(),
      email: user.email.getValue(),
      role: user.role.toString(),
    };
  }

  private async generateAuthResponse(user: User): Promise<AuthResponse> {
    const payload = this.createTokenPayload(user);
    const accessToken = await this.tokenService.generateAccessToken(payload);
    const refreshToken = await this.tokenService.generateRefreshToken(user.id.getValue());

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id.getValue(),
        name: user.name.getValue(),
        email: user.email.getValue(),
        role: user.role.toString(),
      },
    };
  }
}
