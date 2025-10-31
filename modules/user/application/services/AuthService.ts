import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";
import type { IUserQueryRepository } from "../../domain/repositories/IUserQueryRepository.js";
import type { IPasswordHasher } from "./PasswordHasher.js";
import type { ITokenService, TokenPayload } from "./TokenService.js";
import { UserDomainService } from "./UserDomainService.js";
import { User } from "../../domain/entities/User.js";
import { UserId, UserName, Email, Password, Role } from "../../domain/value-objects/index.js";

export interface RegisterUserDto {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

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

export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userQueryRepository: IUserQueryRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService,
    private readonly userDomainService: UserDomainService
  ) {}

  async register(dto: RegisterUserDto): Promise<AuthResponse> {
    const email = Email.create(dto.email);
    const name = UserName.create(dto.name);
    const role = dto.role ? Role.fromString(dto.role) : Role.staff();

    await this.userDomainService.ensureEmailIsUnique(email);

    const hashedPassword = await this.hashPassword(dto.password);
    const user = User.create(name, email, hashedPassword, role);

    await this.userRepository.save(user);
    return this.generateAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const email = Email.create(dto.email);
    const user = await this.findUserByEmail(email);

    this.ensureUserCanLogin(user);
    await this.verifyPassword(dto.password, user.password.getValue());

    return this.generateAuthResponse(user);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const userIdVO = UserId.fromString(userId);
    const user = await this.findUserById(userIdVO);

    await this.verifyPassword(currentPassword, user.password.getValue());

    const hashedPassword = await this.hashPassword(newPassword);
    user.changePassword(hashedPassword);

    await this.userRepository.update(user);
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    return this.tokenService.verifyAccessToken(token);
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);
    const userIdVO = UserId.fromString(payload.userId);
    const user = await this.findUserById(userIdVO);

    this.ensureUserCanLogin(user);

    const tokenPayload = this.createTokenPayload(user);
    const accessToken = await this.tokenService.generateAccessToken(tokenPayload);

    return { accessToken };
  }

  private async findUserById(userId: UserId): Promise<User> {
    const user = await this.userQueryRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  private async findUserByEmail(email: Email): Promise<User> {
    const user = await this.userQueryRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }
    return user;
  }

  private ensureUserCanLogin(user: User): void {
    if (!user.canLogin()) {
      throw new Error("Account is not active");
    }
  }

  private async verifyPassword(plainPassword: string, hashedPassword: string): Promise<void> {
    const isValid = await this.passwordHasher.verify(plainPassword, hashedPassword);
    if (!isValid) {
      throw new Error("Invalid credentials");
    }
  }

  private async hashPassword(plainPassword: string): Promise<Password> {
    const passwordVO = Password.create(plainPassword);
    const hashed = await this.passwordHasher.hash(passwordVO.getValue());
    return Password.create(hashed);
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
