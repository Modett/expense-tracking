import { User } from "../entities/User.js";
import { UserId, Email } from "../value-objects/index.js";

export interface IUserRepository {
  save(user: User): Promise<void>;
  update(user: User): Promise<void>;
  delete(id: UserId): Promise<void>;
  existsByEmail(email: Email): Promise<boolean>;
  existsById(id: UserId): Promise<boolean>;
}
