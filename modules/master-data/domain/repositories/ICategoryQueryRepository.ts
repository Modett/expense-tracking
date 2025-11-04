import type { Category } from "../entities/Category.js";
import type { CategoryId } from "../value-objects/index.js";

export interface CategoryListQuery {
  limit?: number;
  offset?: number;
  isActive?: boolean;
  searchTerm?: string;
}

export interface ICategoryQueryRepository {
  findById(id: CategoryId): Promise<Category | null>;
  findAll(query: CategoryListQuery): Promise<Category[]>;
  findByName(name: string): Promise<Category | null>;
  findActiveCategories(limit?: number, offset?: number): Promise<Category[]>;
  searchCategories(searchTerm: string, limit?: number, offset?: number): Promise<Category[]>;
  count(filters?: { isActive?: boolean }): Promise<number>;
}
