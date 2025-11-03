import { PrismaClient, type RoleEnum } from "@prisma/client";
import type {
  IUserQueryRepository,
  UserListQuery,
} from "../../domain/repositories/IUserQueryRepository.js";
import { User } from "../../domain/entities/User.js";
import {
  UserId,
  UserName,
  Email,
  Password,
  Role,
  UserStatus,
} from "../../domain/value-objects/index.js";

export class PrismaUserQueryRepository implements IUserQueryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapRoleToDatabase(role: string): RoleEnum {
    // Convert domain role (UPPERCASE) to database role (lowercase)
    return role.toLowerCase() as RoleEnum;
  }

  async findById(id: UserId): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { userId: id.getValue() },
    });

    if (!userData) return null;

    return this.toDomain(userData);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { email: email.getValue() },
    });

    if (!userData) return null;

    return this.toDomain(userData);
  }

  async findAll(query: UserListQuery): Promise<User[]> {
    const where: any = {};

    if (query.role) {
      where.role = query.role;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.searchTerm) {
      where.OR = [
        { name: { contains: query.searchTerm, mode: "insensitive" } },
        { email: { contains: query.searchTerm, mode: "insensitive" } },
      ];
    }

    const usersData = await this.prisma.user.findMany({
      where,
      ...(query.limit && { take: query.limit }),
      ...(query.offset && { skip: query.offset }),
      orderBy: { createdAt: "desc" },
    });

    return usersData.map((data) => this.toDomain(data));
  }

  async findByRole(
    role: Role,
    limit?: number,
    offset?: number
  ): Promise<User[]> {
    const usersData = await this.prisma.user.findMany({
      where: { role: this.mapRoleToDatabase(role.getValue()) },
      ...(limit && { take: limit }),
      ...(offset && { skip: offset }),
      orderBy: { createdAt: "desc" },
    });

    return usersData.map((data) => this.toDomain(data));
  }

  async findActiveUsers(limit?: number, offset?: number): Promise<User[]> {
    const usersData = await this.prisma.user.findMany({
      where: { isActive: true },
      ...(limit && { take: limit }),
      ...(offset && { skip: offset }),
      orderBy: { createdAt: "desc" },
    });

    return usersData.map((data) => this.toDomain(data));
  }

  async searchUsers(
    searchTerm: string,
    limit?: number,
    offset?: number
  ): Promise<User[]> {
    const usersData = await this.prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      ...(limit && { take: limit }),
      ...(offset && { skip: offset }),
      orderBy: { createdAt: "desc" },
    });

    return usersData.map((data) => this.toDomain(data));
  }

  async count(filters?: {
    role?: string;
    isActive?: boolean;
  }): Promise<number> {
    const where: any = {};

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return this.prisma.user.count({ where });
  }

  private toDomain(data: {
    userId: string;
    name: string;
    email: string;
    password: string;
    role: RoleEnum;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return User.fromPersistence(
      UserId.fromString(data.userId),
      UserName.create(data.name),
      Email.create(data.email),
      Password.fromHash(data.password),
      Role.fromString(data.role),
      data.isActive ? UserStatus.active() : UserStatus.inactive(),
      data.createdAt,
      data.updatedAt
    );
  }
}
