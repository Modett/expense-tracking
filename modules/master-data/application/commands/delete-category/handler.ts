import type { ICategoryCommandRepository } from "../../../domain/repositories/ICategoryCommandRepository.js";
import type { ICategoryQueryRepository } from "../../../domain/repositories/ICategoryQueryRepository.js";
import { CategoryId } from "../../../domain/value-objects/index.js";
import type { DeleteCategoryCommand } from "./command.js";

export class DeleteCategoryCommandHandler {
  constructor(
    private readonly categoryRepository: ICategoryCommandRepository,
    private readonly categoryQueryRepository: ICategoryQueryRepository
  ) {}

  async handle(command: DeleteCategoryCommand): Promise<void> {
    const categoryId = CategoryId.fromString(command.id);

    const category = await this.categoryQueryRepository.findById(categoryId);
    if (!category) {
      throw new Error(`Category with id "${command.id}" not found`);
    }

    await this.categoryRepository.delete(categoryId);
  }
}
