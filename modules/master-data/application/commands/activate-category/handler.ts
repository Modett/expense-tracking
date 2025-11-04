import type { ICategoryCommandRepository } from "../../../domain/repositories/ICategoryCommandRepository.js";
import type { ICategoryQueryRepository } from "../../../domain/repositories/ICategoryQueryRepository.js";
import { CategoryId } from "../../../domain/value-objects/index.js";
import type { ActivateCategoryCommand } from "./command.js";

export class ActivateCategoryCommandHandler {
  constructor(
    private readonly categoryRepository: ICategoryCommandRepository,
    private readonly categoryQueryRepository: ICategoryQueryRepository
  ) {}

  async handle(command: ActivateCategoryCommand): Promise<void> {
    const categoryId = CategoryId.fromString(command.id);

    const category = await this.categoryQueryRepository.findById(categoryId);
    if (!category) {
      throw new Error(`Category with id "${command.id}" not found`);
    }

    category.activate();

    await this.categoryRepository.update(category);
  }
}
