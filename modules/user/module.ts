import type { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";

// Repositories
import { PrismaUserRepository } from "./infra/persistence/PrismaUserRepository.js";
import { PrismaUserQueryRepository } from "./infra/persistence/PrismaUserQueryRepository.js";

// Services
import { BcryptPasswordHasher } from "./infra/security/BcryptPasswordHasher.js";
import { JwtTokenService } from "./infra/security/JwtTokenService.js";
import { UserDomainService } from "./application/services/UserDomainService.js";

// Command Handlers
import { RegisterCommandHandler } from "./application/commands/auth/register/handler.js";
import { LoginCommandHandler } from "./application/commands/auth/login/handler.js";
import { ChangePasswordCommandHandler } from "./application/commands/auth/change-password/handler.js";
import { RefreshTokenCommandHandler } from "./application/commands/auth/refresh-token/handler.js";
import { LogoutCommandHandler } from "./application/commands/auth/logout/handler.js";
import { UpdateProfileCommandHandler } from "./application/commands/user-management/update-profile/handler.js";
import { UpdateRoleCommandHandler } from "./application/commands/user-management/update-role/handler.js";
import { ActivateUserCommandHandler } from "./application/commands/user-management/activate-user/handler.js";
import { DeactivateUserCommandHandler } from "./application/commands/user-management/deactivate-user/handler.js";
import { DeleteUserCommandHandler } from "./application/commands/user-management/delete-user/handler.js";

// Query Handlers
import { GetUserByIdQueryHandler } from "./application/queries/get-user-by-id/handler.js";
import { GetAllUsersQueryHandler } from "./application/queries/get-all-users/handler.js";

// Controllers
import { AuthController } from "./infra/http/controllers/AuthController.js";
import { UserController } from "./infra/http/controllers/UserController.js";

// Routes
import { registerUserRoutes } from "./infra/http/routes.js";

export interface UserModuleConfig {
  jwtSecret: string;
  jwtAccessTokenExpiry: string;
  jwtRefreshTokenExpiry: string;
  bcryptSaltRounds?: number;
}

export async function registerUserModule(
  fastify: FastifyInstance,
  prisma: PrismaClient,
  config: UserModuleConfig
): Promise<{ userQueryRepo: PrismaUserQueryRepository }> {
  // Infrastructure - Repositories
  const userRepository = new PrismaUserRepository(prisma);
  const userQueryRepository = new PrismaUserQueryRepository(prisma);

  // Infrastructure - Security Services
  const passwordHasher = new BcryptPasswordHasher(config.bcryptSaltRounds || 12);
  const tokenService = new JwtTokenService({
    secret: config.jwtSecret,
    accessTokenExpiry: config.jwtAccessTokenExpiry,
    refreshTokenExpiry: config.jwtRefreshTokenExpiry,
  });

  // Domain Services
  const userDomainService = new UserDomainService(userRepository);

  // Command Handlers - Auth
  const registerHandler = new RegisterCommandHandler(
    userRepository,
    passwordHasher,
    tokenService,
    userDomainService
  );

  const loginHandler = new LoginCommandHandler(
    userQueryRepository,
    passwordHasher,
    tokenService
  );

  const changePasswordHandler = new ChangePasswordCommandHandler(
    userRepository,
    userQueryRepository,
    passwordHasher
  );

  const refreshTokenHandler = new RefreshTokenCommandHandler(
    userQueryRepository,
    tokenService
  );

  const logoutHandler = new LogoutCommandHandler(prisma);

  // Command Handlers - User Management
  const updateProfileHandler = new UpdateProfileCommandHandler(
    userRepository,
    userQueryRepository
  );

  const updateRoleHandler = new UpdateRoleCommandHandler(
    userRepository,
    userQueryRepository
  );

  const activateUserHandler = new ActivateUserCommandHandler(
    userRepository,
    userQueryRepository
  );

  const deactivateUserHandler = new DeactivateUserCommandHandler(
    userRepository,
    userQueryRepository
  );

  const deleteUserHandler = new DeleteUserCommandHandler(userRepository);

  // Query Handlers
  const getUserByIdHandler = new GetUserByIdQueryHandler(userQueryRepository);
  const getAllUsersHandler = new GetAllUsersQueryHandler(userQueryRepository);

  // Controllers
  const authController = new AuthController(
    registerHandler,
    loginHandler,
    changePasswordHandler,
    refreshTokenHandler,
    logoutHandler,
    updateProfileHandler
  );

  const userController = new UserController(
    updateProfileHandler,
    updateRoleHandler,
    activateUserHandler,
    deactivateUserHandler,
    deleteUserHandler,
    getUserByIdHandler,
    getAllUsersHandler
  );

  // Register Routes
  await registerUserRoutes(fastify, authController, userController, prisma);

  // Return repository for cross-module usage
  return { userQueryRepo: userQueryRepository };
}
