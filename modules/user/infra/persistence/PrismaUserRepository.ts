import { PrismaClient, type RoleEnum } from "@prisma/client";
import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";
import { User } from "../../domain/entities/User.js";
import { UserId, Email } from "../../domain/value-objects/index.js";

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapRoleToDatabase(role: string): RoleEnum {
    // Convert domain role (UPPERCASE) to database role (lowercase)
    return role.toLowerCase() as RoleEnum;
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.create({
      data: {
        userId: user.id.getValue(),
        name: user.name.getValue(),
        email: user.email.getValue(),
        password: user.password.getValue(),
        role: this.mapRoleToDatabase(user.role.getValue()),
        isActive: user.status.isActive(),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  }

  async update(user: User): Promise<void> {
    await this.prisma.user.update({
      where: { userId: user.id.getValue() },
      data: {
        name: user.name.getValue(),
        email: user.email.getValue(),
        password: user.password.getValue(),
        role: this.mapRoleToDatabase(user.role.getValue()),
        isActive: user.status.isActive(),
        updatedAt: user.updatedAt,
      },
    });
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email: email.getValue() },
    });

    return count > 0;
  }

  async existsById(id: UserId): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { userId: id.getValue() },
    });

    return count > 0;
  }

  async delete(id: UserId): Promise<void> {
    await this.prisma.user.delete({
      where: { userId: id.getValue() },
    });
  }
}
