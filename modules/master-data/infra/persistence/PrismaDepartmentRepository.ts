import type { PrismaClient } from "@prisma/client";
import type { IDepartmentCommandRepository } from "../../domain/repositories/IDepartmentCommandRepository.js";
import type { Department } from "../../domain/entities/Department.js";
import type { DepartmentId } from "../../domain/value-objects/index.js";

export class PrismaDepartmentRepository implements IDepartmentCommandRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(department: Department): Promise<void> {
    await this.prisma.department.create({
      data: {
        departmentId: department.id.getValue(),
        name: department.getName().getValue(),
        code: department.getCode().getValue(),
        isActive: department.isActive(),
        createdAt: department.createdAt,
        updatedAt: department.updatedAt,
      },
    });
  }

  async update(department: Department): Promise<void> {
    await this.prisma.department.update({
      where: { departmentId: department.id.getValue() },
      data: {
        name: department.getName().getValue(),
        code: department.getCode().getValue(),
        isActive: department.isActive(),
        updatedAt: department.updatedAt,
      },
    });
  }

  async delete(id: DepartmentId): Promise<void> {
    await this.prisma.department.delete({
      where: { departmentId: id.getValue() },
    });
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.prisma.department.count({
      where: { name },
    });
    return count > 0;
  }

  async existsByNameExcludingId(name: string, excludeId: DepartmentId): Promise<boolean> {
    const count = await this.prisma.department.count({
      where: {
        name,
        departmentId: { not: excludeId.getValue() },
      },
    });
    return count > 0;
  }

  async existsByCode(code: string): Promise<boolean> {
    const count = await this.prisma.department.count({
      where: { code },
    });
    return count > 0;
  }

  async existsByCodeExcludingId(code: string, excludeId: DepartmentId): Promise<boolean> {
    const count = await this.prisma.department.count({
      where: {
        code,
        departmentId: { not: excludeId.getValue() },
      },
    });
    return count > 0;
  }
}
