import bcrypt from "bcrypt";
import type { IPasswordHasher } from "../../application/services/PasswordHasher.js";

export class BcryptPasswordHasher implements IPasswordHasher {
  private readonly saltRounds: number;

  constructor(saltRounds: number = 12) {
    this.saltRounds = saltRounds;
  }

  async hash(plainPassword: string): Promise<string> {
    if (!plainPassword) {
      throw new Error("Password cannot be empty");
    }

    return bcrypt.hash(plainPassword, this.saltRounds);
  }

  async verify(plainPassword: string, hashedPassword: string): Promise<boolean> {
    if (!plainPassword || !hashedPassword) {
      throw new Error("Password and hash are required");
    }

    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
