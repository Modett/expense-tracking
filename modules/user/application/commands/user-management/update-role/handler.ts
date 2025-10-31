import type { IUserRepository } from "../../../../domain/repositories/IUserRepository.js";
import type { IUserQueryRepository } from "../../../../domain/repositories/IUserQueryRepository.js";
import { UserId, Role } from "../../../../domain/value-objects/index.js";
import { UpdateRoleCommand } from "./command.js";

export class UpdateRoleCommandHandler {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userQueryRepository: IUserQueryRepository
  ) {}

  async handle(command: UpdateRoleCommand): Promise<void> {
    const userId = UserId.fromString(command.userId);
    const user = await this.userQueryRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const newRole = Role.fromString(command.newRole);
    user.updateRole(newRole);

    await this.userRepository.update(user);
  }
}
