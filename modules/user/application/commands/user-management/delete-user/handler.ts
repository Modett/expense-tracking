import type { IUserRepository } from "../../../../domain/repositories/IUserRepository.js";
import { UserId } from "../../../../domain/value-objects/index.js";
import { DeleteUserCommand } from "./command.js";

export class DeleteUserCommandHandler {
  constructor(private readonly userRepository: IUserRepository) {}

  async handle(command: DeleteUserCommand): Promise<void> {
    const userId = UserId.fromString(command.userId);
    const exists = await this.userRepository.existsById(userId);

    if (!exists) {
      throw new Error("User not found");
    }

    await this.userRepository.delete(userId);
  }
}
