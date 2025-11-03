import type { IUserRepository } from "../../../../domain/repositories/IUserRepository.js";
import type { IUserQueryRepository } from "../../../../domain/repositories/IUserQueryRepository.js";
import type { IPasswordHasher } from "../../../services/PasswordHasher.js";
import { UserId, Password } from "../../../../domain/value-objects/index.js";
import { ChangePasswordCommand } from "./command.js";

export class ChangePasswordCommandHandler {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userQueryRepository: IUserQueryRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async handle(command: ChangePasswordCommand): Promise<void> {
    const userId = UserId.fromString(command.userId);
    const user = await this.userQueryRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const isValidPassword = await this.passwordHasher.verify(
      command.currentPassword,
      user.password.getValue()
    );

    if (!isValidPassword) {
      throw new Error("Current password is incorrect");
    }

    const plainPassword = Password.create(command.newPassword);
    const hashedPassword = await this.passwordHasher.hash(
      plainPassword.getValue()
    );
    const passwordVO = Password.fromHash(hashedPassword);

    user.changePassword(passwordVO);
    await this.userRepository.update(user);
  }
}
