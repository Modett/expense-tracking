import type { IUserRepository } from "../../../../domain/repositories/IUserRepository.js";
import type { IUserQueryRepository } from "../../../../domain/repositories/IUserQueryRepository.js";
import { UserId } from "../../../../domain/value-objects/index.js";
import { ActivateUserCommand } from "./command.js";

export class ActivateUserCommandHandler {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userQueryRepository: IUserQueryRepository
  ) {}

  async handle(command: ActivateUserCommand): Promise<void> {
    const userId = UserId.fromString(command.userId);
    const user = await this.userQueryRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    user.activate();
    await this.userRepository.update(user);
  }
}
