import type { IUserRepository } from "../../../../domain/repositories/IUserRepository.js";
import type { IUserQueryRepository } from "../../../../domain/repositories/IUserQueryRepository.js";
import { UserId } from "../../../../domain/value-objects/index.js";
import { DeactivateUserCommand } from "./command.js";

export class DeactivateUserCommandHandler {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userQueryRepository: IUserQueryRepository
  ) {}

  async handle(command: DeactivateUserCommand): Promise<void> {
    const userId = UserId.fromString(command.userId);
    const user = await this.userQueryRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    user.deactivate();
    await this.userRepository.update(user);
  }
}
