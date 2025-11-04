import type { PrismaClient } from "@prisma/client";
import type {
  ICategoryQueryRepository,
  CategoryListQuery,
} from "../../domain/repositories/ICategoryQueryRepository.js";
import { Category } from "../../domain/entities/Category.js";
import {
  CategoryId,
  CategoryName,
  CategoryStatus,
  Description,
} from "../../domain/value-objects/index.js";

export class PrismaCategoryQueryRepository implements ICategoryQueryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: CategoryId): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { categoryId: id.getValue() },
    });

    if (!category) {
      return null;
    }

    return Category.fromPersistence(
      CategoryId.fromString(category.categoryId),
      CategoryName.create(category.name),
      Description.fromString(category.description),
      CategoryStatus.fromBoolean(category.isActive),
      category.createdAt,
      category.updatedAt
    );
  }

  async findAll(query: CategoryListQuery): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: {
        ...(query.isActive !== undefined && { isActive: query.isActive }),
        ...(query.searchTerm && {
          OR: [
            { name: { contains: query.searchTerm, mode: "insensitive" } },
            {
              description: { contains: query.searchTerm, mode: "insensitive" },
            },
          ],
        }),
      },
      ...(query.limit !== undefined && { take: query.limit }),
      ...(query.offset !== undefined && { skip: query.offset }),
      orderBy: { createdAt: "desc" },
    });

    return categories.map((category) =>
      Category.fromPersistence(
        CategoryId.fromString(category.categoryId),
        CategoryName.create(category.name),
        Description.fromString(category.description),
        CategoryStatus.fromBoolean(category.isActive),
        category.createdAt,
        category.updatedAt
      )
    );
  }

  async findByName(name: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { name },
    });

    if (!category) {
      return null;
    }

    return Category.fromPersistence(
      CategoryId.fromString(category.categoryId),
      CategoryName.create(category.name),
      Description.fromString(category.description),
      CategoryStatus.fromBoolean(category.isActive),
      category.createdAt,
      category.updatedAt
    );
  }

  async findActiveCategories(
    limit?: number,
    offset?: number
  ): Promise<Category[]> {
    return this.findAll({
      ...(limit !== undefined && { limit }),
      ...(offset !== undefined && { offset }),
      isActive: true,
    });
  }

  async searchCategories(
    searchTerm: string,
    limit?: number,
    offset?: number
  ): Promise<Category[]> {
    return this.findAll({
      searchTerm,
      ...(limit !== undefined && { limit }),
      ...(offset !== undefined && { offset }),
    });
  }

  async count(filters?: { isActive?: boolean }): Promise<number> {
    return this.prisma.category.count({
      where: {
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      },
    });
  }
}
