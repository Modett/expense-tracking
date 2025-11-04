import type { Category } from "../entities/Category.js";
import type { CategoryId } from "../value-objects/index.js";

export interface ICategoryCommandRepository {
  save(category: Category): Promise<void>;
  update(category: Category): Promise<void>;
  delete(id: CategoryId): Promise<void>;
  existsByName(name: string): Promise<boolean>;
  existsByNameExcludingId(name: string, excludeId: CategoryId): Promise<boolean>;
}
