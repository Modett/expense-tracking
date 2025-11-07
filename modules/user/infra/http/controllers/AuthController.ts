import type { FastifyReply, FastifyRequest } from "fastify";
import { RegisterCommandHandler } from "../../../application/commands/auth/register/handler.js";
import { LoginCommandHandler } from "../../../application/commands/auth/login/handler.js";
import { ChangePasswordCommandHandler } from "../../../application/commands/auth/change-password/handler.js";
import { RefreshTokenCommandHandler } from "../../../application/commands/auth/refresh-token/handler.js";
import { LogoutCommandHandler } from "../../../application/commands/auth/logout/handler.js";
import { RegisterCommand } from "../../../application/commands/auth/register/command.js";
import { LoginCommand } from "../../../application/commands/auth/login/command.js";
import { ChangePasswordCommand } from "../../../application/commands/auth/change-password/command.js";
import { RefreshTokenCommand } from "../../../application/commands/auth/refresh-token/command.js";
import { LogoutCommand } from "../../../application/commands/auth/logout/command.js";
import { registerSchema, type RegisterDto } from "../validators/auth/register.validator.js";
import { loginSchema, type LoginDto } from "../validators/auth/login.validator.js";
import { changePasswordSchema, type ChangePasswordDto } from "../validators/auth/change-password.validator.js";
import { refreshTokenSchema, type RefreshTokenDto } from "../validators/auth/refresh-token.validator.js";

export class AuthController {
  constructor(
    private readonly registerHandler: RegisterCommandHandler,
    private readonly loginHandler: LoginCommandHandler,
    private readonly changePasswordHandler: ChangePasswordCommandHandler,
    private readonly refreshTokenHandler: RefreshTokenCommandHandler,
    private readonly logoutHandler: LogoutCommandHandler
  ) {}

  async register(
    request: FastifyRequest<{ Body: RegisterDto }>,
    reply: FastifyReply
  ): Promise<void> {
    const validatedData = registerSchema.parse(request.body);

    const command = new RegisterCommand(
      validatedData.name,
      validatedData.email,
      validatedData.password,
      validatedData.role
    );

    const response = await this.registerHandler.handle(command);

    reply.code(201).send(response);
  }

  async login(
    request: FastifyRequest<{ Body: LoginDto }>,
    reply: FastifyReply
  ): Promise<void> {
    const validatedData = loginSchema.parse(request.body);

    const command = new LoginCommand(validatedData.email, validatedData.password);

    const response = await this.loginHandler.handle(command);

    reply.code(200).send(response);
  }

  async changePassword(
    request: FastifyRequest<{ Body: ChangePasswordDto }>,
    reply: FastifyReply
  ): Promise<void> {
    const validatedData = changePasswordSchema.parse(request.body);

    const command = new ChangePasswordCommand(
      request.user.userId,
      validatedData.currentPassword,
      validatedData.newPassword
    );

    await this.changePasswordHandler.handle(command);

    reply.code(200).send({ message: "Password changed successfully" });
  }

  async refreshToken(
    request: FastifyRequest<{ Body: RefreshTokenDto }>,
    reply: FastifyReply
  ): Promise<void> {
    const validatedData = refreshTokenSchema.parse(request.body);

    const command = new RefreshTokenCommand(validatedData.refreshToken);

    const response = await this.refreshTokenHandler.handle(command);

    reply.code(200).send(response);
  }

  async logout(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    // Get userId from authenticated request (set by authenticate middleware)
    const userId = request.user.userId;

    // Extract access token from Authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      reply.code(401).send({ error: 'Missing or invalid authorization header' });
      return;
    }
    const accessToken = authHeader.substring(7); // Remove "Bearer " prefix

    const command = new LogoutCommand(userId, accessToken);

    const response = await this.logoutHandler.handle(command);

    reply.code(200).send(response);
  }
}
