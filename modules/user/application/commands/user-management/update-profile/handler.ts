import type { IUserRepository } from "../../../../domain/repositories/IUserRepository.js";
import type { IUserQueryRepository } from "../../../../domain/repositories/IUserQueryRepository.js";
import { UserId, UserName, Email } from "../../../../domain/value-objects/index.js";
import { UpdateProfileCommand } from "./command.js";

export class UpdateProfileCommandHandler {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userQueryRepository: IUserQueryRepository
  ) {}

  async handle(command: UpdateProfileCommand): Promise<void> {
    const userId = UserId.fromString(command.userId);
    const user = await this.userQueryRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const name = UserName.create(command.name);
    const email = Email.create(command.email);

    if (!user.email.equals(email)) {
      const emailExists = await this.userRepository.existsByEmail(email);
      if (emailExists) {
        throw new Error("Email is already in use");
      }
    }

    user.updateProfile(name, email);
    await this.userRepository.update(user);
  }
}
