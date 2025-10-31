import { User } from "../entities/User.js";
import { UserId, Email } from "../value-objects/index.js";

export interface IUserRepository {
  // Core operations
  save(user: User): Promise<void>;
  update(user: User): Promise<void>;
  delete(id: UserId): Promise<void>;

  // Find operations
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findAll(): Promise<User[]>;
  findByRole(role: string): Promise<User[]>;
  findActiveUsers(): Promise<User[]>;

  // Check operations
  existsByEmail(email: Email): Promise<boolean>;
  existsById(id: UserId): Promise<boolean>;

  // Utility
  count(): Promise<number>;
}
