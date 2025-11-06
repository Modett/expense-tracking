import type { PrismaClient } from "@prisma/client";
import type {
  IDepartmentQueryRepository,
  DepartmentListQuery,
} from "../../domain/repositories/IDepartmentQueryRepository.js";
import { Department } from "../../domain/entities/Department.js";
import {
  DepartmentId,
  DepartmentName,
  DepartmentCode,
  DepartmentStatus,
} from "../../domain/value-objects/index.js";

export class PrismaDepartmentQueryRepository implements IDepartmentQueryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: DepartmentId): Promise<Department | null> {
    const department = await this.prisma.department.findUnique({
      where: { departmentId: id.getValue() },
    });

    if (!department) {
      return null;
    }

    return Department.fromPersistence(
      DepartmentId.fromString(department.departmentId),
      DepartmentName.create(department.name),
      DepartmentCode.fromString(department.code),
      DepartmentStatus.fromBoolean(department.isActive),
      department.createdAt,
      department.updatedAt
    );
  }

  async findAll(query: DepartmentListQuery): Promise<Department[]> {
    const departments = await this.prisma.department.findMany({
      where: {
        ...(query.isActive !== undefined && { isActive: query.isActive }),
        ...(query.searchTerm && {
          OR: [
            { name: { contains: query.searchTerm, mode: "insensitive" } },
            { code: { contains: query.searchTerm, mode: "insensitive" } },
          ],
        }),
      },
      ...(query.limit !== undefined && { take: query.limit }),
      ...(query.offset !== undefined && { skip: query.offset }),
      orderBy: { createdAt: "desc" },
    });

    return departments.map((department) =>
      Department.fromPersistence(
        DepartmentId.fromString(department.departmentId),
        DepartmentName.create(department.name),
        DepartmentCode.fromString(department.code),
        DepartmentStatus.fromBoolean(department.isActive),
        department.createdAt,
        department.updatedAt
      )
    );
  }

  async findByName(name: string): Promise<Department | null> {
    const department = await this.prisma.department.findUnique({
      where: { name },
    });

    if (!department) {
      return null;
    }

    return Department.fromPersistence(
      DepartmentId.fromString(department.departmentId),
      DepartmentName.create(department.name),
      DepartmentCode.fromString(department.code),
      DepartmentStatus.fromBoolean(department.isActive),
      department.createdAt,
      department.updatedAt
    );
  }

  async findByCode(code: string): Promise<Department | null> {
    const department = await this.prisma.department.findUnique({
      where: { code },
    });

    if (!department) {
      return null;
    }

    return Department.fromPersistence(
      DepartmentId.fromString(department.departmentId),
      DepartmentName.create(department.name),
      DepartmentCode.fromString(department.code),
      DepartmentStatus.fromBoolean(department.isActive),
      department.createdAt,
      department.updatedAt
    );
  }

  async findActiveDepartments(
    limit?: number,
    offset?: number
  ): Promise<Department[]> {
    return this.findAll({
      ...(limit !== undefined && { limit }),
      ...(offset !== undefined && { offset }),
      isActive: true,
    });
  }

  async searchDepartments(
    searchTerm: string,
    limit?: number,
    offset?: number
  ): Promise<Department[]> {
    return this.findAll({
      searchTerm,
      ...(limit !== undefined && { limit }),
      ...(offset !== undefined && { offset }),
    });
  }

  async count(filters?: { isActive?: boolean }): Promise<number> {
    return this.prisma.department.count({
      where: {
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      },
    });
  }
}
