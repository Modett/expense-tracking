import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";
import { Email } from "../../domain/value-objects/index.js";
import type { User } from "../../domain/entities/User.js";

export class UserDomainService {
  constructor(private readonly userRepository: IUserRepository) {}

  async isEmailUnique(email: Email): Promise<boolean> {
    const exists = await this.userRepository.existsByEmail(email);
    return !exists;
  }

  async ensureEmailIsUnique(email: Email): Promise<void> {
    const isUnique = await this.isEmailUnique(email);
    if (!isUnique) {
      throw new Error("Email already exists");
    }
  }

  async canUserBeDeleted(_user: User): Promise<boolean> {
    return true;
  }

  async validateUserUpdate(user: User, newEmail: Email): Promise<void> {
    const currentEmail = user.email;

    if (!currentEmail.equals(newEmail)) {
      await this.ensureEmailIsUnique(newEmail);
    }
  }
}
