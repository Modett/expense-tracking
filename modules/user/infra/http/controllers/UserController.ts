import type { FastifyReply, FastifyRequest } from "fastify";
import { UpdateProfileCommandHandler } from "../../../application/commands/user-management/update-profile/handler.js";
import { UpdateRoleCommandHandler } from "../../../application/commands/user-management/update-role/handler.js";
import { ActivateUserCommandHandler } from "../../../application/commands/user-management/activate-user/handler.js";
import { DeactivateUserCommandHandler } from "../../../application/commands/user-management/deactivate-user/handler.js";
import { DeleteUserCommandHandler } from "../../../application/commands/user-management/delete-user/handler.js";
import { GetUserByIdQueryHandler } from "../../../application/queries/get-user-by-id/handler.js";
import { GetAllUsersQueryHandler } from "../../../application/queries/get-all-users/handler.js";
import { UpdateProfileCommand } from "../../../application/commands/user-management/update-profile/command.js";
import { UpdateRoleCommand } from "../../../application/commands/user-management/update-role/command.js";
import { ActivateUserCommand } from "../../../application/commands/user-management/activate-user/command.js";
import { DeactivateUserCommand } from "../../../application/commands/user-management/deactivate-user/command.js";
import { DeleteUserCommand } from "../../../application/commands/user-management/delete-user/command.js";
import { GetUserByIdQuery } from "../../../application/queries/get-user-by-id/query.js";
import { GetAllUsersQuery } from "../../../application/queries/get-all-users/query.js";
import { updateProfileSchema, type UpdateProfileDto } from "../validators/user-management/update-profile.validator.js";
import { updateRoleSchema, type UpdateRoleDto } from "../validators/user-management/update-role.validator.js";
import { getUserByIdParamsSchema, type GetUserByIdParams } from "../validators/queries/get-user-by-id.validator.js";
import { getAllUsersQuerySchema, type GetAllUsersQuery as GetAllUsersQueryDto } from "../validators/queries/get-all-users.validator.js";

export class UserController {
  constructor(
    private readonly updateProfileHandler: UpdateProfileCommandHandler,
    private readonly updateRoleHandler: UpdateRoleCommandHandler,
    private readonly activateUserHandler: ActivateUserCommandHandler,
    private readonly deactivateUserHandler: DeactivateUserCommandHandler,
    private readonly deleteUserHandler: DeleteUserCommandHandler,
    private readonly getUserByIdHandler: GetUserByIdQueryHandler,
    private readonly getAllUsersHandler: GetAllUsersQueryHandler
  ) {}

  async getUserById(
    request: FastifyRequest<{ Params: GetUserByIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const validatedParams = getUserByIdParamsSchema.parse(request.params);

    const query = new GetUserByIdQuery(validatedParams.userId);

    const user = await this.getUserByIdHandler.handle(query);

    if (!user) {
      return reply.code(404).send({ error: "User not found" });
    }

    reply.code(200).send(user);
  }

  async getAllUsers(
    request: FastifyRequest<{ Querystring: GetAllUsersQueryDto }>,
    reply: FastifyReply
  ): Promise<void> {
    const validatedQuery = getAllUsersQuerySchema.parse(request.query);

    const query = new GetAllUsersQuery(
      validatedQuery.limit,
      validatedQuery.offset,
      validatedQuery.role,
      validatedQuery.isActive,
      validatedQuery.searchTerm
    );

    const users = await this.getAllUsersHandler.handle(query);

    reply.code(200).send(users);
  }

  async updateProfile(
    request: FastifyRequest<{ Params: GetUserByIdParams; Body: UpdateProfileDto }>,
    reply: FastifyReply
  ): Promise<void> {
    const validatedParams = getUserByIdParamsSchema.parse(request.params);
    const validatedBody = updateProfileSchema.parse(request.body);

    const command = new UpdateProfileCommand(
      validatedParams.userId,
      validatedBody.name,
      validatedBody.email
    );

    await this.updateProfileHandler.handle(command);

    reply.code(200).send({ message: "Profile updated successfully" });
  }

  async updateRole(
    request: FastifyRequest<{ Params: GetUserByIdParams; Body: UpdateRoleDto }>,
    reply: FastifyReply
  ): Promise<void> {
    const validatedParams = getUserByIdParamsSchema.parse(request.params);
    const validatedBody = updateRoleSchema.parse(request.body);

    const command = new UpdateRoleCommand(validatedParams.userId, validatedBody.role);

    await this.updateRoleHandler.handle(command);

    reply.code(200).send({ message: "Role updated successfully" });
  }

  async activateUser(
    request: FastifyRequest<{ Params: GetUserByIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const validatedParams = getUserByIdParamsSchema.parse(request.params);

    const command = new ActivateUserCommand(validatedParams.userId);

    await this.activateUserHandler.handle(command);

    reply.code(200).send({ message: "User activated successfully" });
  }

  async deactivateUser(
    request: FastifyRequest<{ Params: GetUserByIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const validatedParams = getUserByIdParamsSchema.parse(request.params);

    const command = new DeactivateUserCommand(validatedParams.userId);

    await this.deactivateUserHandler.handle(command);

    reply.code(200).send({ message: "User deactivated successfully" });
  }

  async deleteUser(
    request: FastifyRequest<{ Params: GetUserByIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const validatedParams = getUserByIdParamsSchema.parse(request.params);

    const command = new DeleteUserCommand(validatedParams.userId);

    await this.deleteUserHandler.handle(command);

    reply.code(200).send({ message: "User deleted successfully" });
  }
}
