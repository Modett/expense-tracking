import type { PrismaClient } from "@prisma/client";
import type { ICategoryCommandRepository } from "../../domain/repositories/ICategoryCommandRepository.js";
import type { Category } from "../../domain/entities/Category.js";
import type { CategoryId } from "../../domain/value-objects/index.js";

export class PrismaCategoryRepository implements ICategoryCommandRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(category: Category): Promise<void> {
    await this.prisma.category.create({
      data: {
        categoryId: category.id.getValue(),
        name: category.getName().getValue(),
        description: category.getDescription().getValue(),
        isActive: category.isActive(),
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
    });
  }

  async update(category: Category): Promise<void> {
    await this.prisma.category.update({
      where: { categoryId: category.id.getValue() },
      data: {
        name: category.getName().getValue(),
        description: category.getDescription().getValue(),
        isActive: category.isActive(),
        updatedAt: category.updatedAt,
      },
    });
  }

  async delete(id: CategoryId): Promise<void> {
    await this.prisma.category.delete({
      where: { categoryId: id.getValue() },
    });
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.prisma.category.count({
      where: { name },
    });
    return count > 0;
  }

  async existsByNameExcludingId(name: string, excludeId: CategoryId): Promise<boolean> {
    const count = await this.prisma.category.count({
      where: {
        name,
        categoryId: { not: excludeId.getValue() },
      },
    });
    return count > 0;
  }
}
