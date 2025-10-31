import type { IUserRepository } from "../../../../domain/repositories/IUserRepository.js";
import type { IPasswordHasher } from "../../../services/PasswordHasher.js";
import type { ITokenService, TokenPayload } from "../../../services/TokenService.js";
import { UserDomainService } from "../../../services/UserDomainService.js";
import { User } from "../../../../domain/entities/User.js";
import { UserName, Email, Password, Role } from "../../../../domain/value-objects/index.js";
import { RegisterCommand } from "./command.js";

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

export class RegisterCommandHandler {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService,
    private readonly userDomainService: UserDomainService
  ) {}

  async handle(command: RegisterCommand): Promise<AuthResponse> {
    const email = Email.create(command.email);
    const name = UserName.create(command.name);
    const role = command.role ? Role.fromString(command.role) : Role.staff();

    await this.userDomainService.ensureEmailIsUnique(email);

    const plainPassword = Password.create(command.password);
    const hashedPassword = await this.passwordHasher.hash(plainPassword.getValue());
    const passwordVO = Password.fromHash(hashedPassword);

    const user = User.create(name, email, passwordVO, role);
    await this.userRepository.save(user);

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
