import type { User } from "../../domain/entities/User.js";
import type { UserId } from "../../domain/value-objects/UserId.js";
import type { Email } from "../../domain/value-objects/Email.js";
import type { Role } from "../../domain/value-objects/Role.js";

export interface UserListQuery {
  limit?: number;
  offset?: number;
  role?: string;
  isActive?: boolean;
  searchTerm?: string;
}

export interface IUserQueryRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findAll(query: UserListQuery): Promise<User[]>;
  findByRole(role: Role, limit?: number, offset?: number): Promise<User[]>;
  findActiveUsers(limit?: number, offset?: number): Promise<User[]>;
  searchUsers(searchTerm: string, limit?: number, offset?: number): Promise<User[]>;
  count(filters?: { role?: string; isActive?: boolean }): Promise<number>;
}
