import type { ICategoryCommandRepository } from "../../domain/repositories/ICategoryCommandRepository.js";
import type { CategoryId, CategoryName } from "../../domain/value-objects/index.js";

export class CategoryDomainService {
  constructor(private readonly categoryRepository: ICategoryCommandRepository) {}

  async ensureNameIsUnique(name: CategoryName): Promise<void> {
    const exists = await this.categoryRepository.existsByName(name.getValue());
    if (exists) {
      throw new Error(`Category with name "${name.getValue()}" already exists`);
    }
  }

  async ensureNameIsUniqueForUpdate(
    name: CategoryName,
    currentCategoryId: CategoryId
  ): Promise<void> {
    const exists = await this.categoryRepository.existsByNameExcludingId(
      name.getValue(),
      currentCategoryId
    );
    if (exists) {
      throw new Error(`Category with name "${name.getValue()}" already exists`);
    }
  }
}
