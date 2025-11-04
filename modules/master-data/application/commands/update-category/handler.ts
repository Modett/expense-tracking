import type { ICategoryCommandRepository } from "../../../domain/repositories/ICategoryCommandRepository.js";
import type { ICategoryQueryRepository } from "../../../domain/repositories/ICategoryQueryRepository.js";
import { CategoryId, CategoryName } from "../../../domain/value-objects/index.js";
import { CategoryDomainService } from "../../services/CategoryDomainService.js";
import type { UpdateCategoryCommand } from "./command.js";

export interface UpdateCategoryResponse {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  updatedAt: Date;
}

export class UpdateCategoryCommandHandler {
  constructor(
    private readonly categoryRepository: ICategoryCommandRepository,
    private readonly categoryQueryRepository: ICategoryQueryRepository,
    private readonly categoryDomainService: CategoryDomainService
  ) {}

  async handle(command: UpdateCategoryCommand): Promise<UpdateCategoryResponse> {
    const categoryId = CategoryId.fromString(command.id);
    const name = CategoryName.create(command.name);

    const category = await this.categoryQueryRepository.findById(categoryId);
    if (!category) {
      throw new Error(`Category with id "${command.id}" not found`);
    }

    await this.categoryDomainService.ensureNameIsUniqueForUpdate(name, categoryId);

    category.update(name, command.description);

    await this.categoryRepository.update(category);

    return {
      id: category.id.getValue(),
      name: category.getName().getValue(),
      description: category.getDescription().getValue(),
      isActive: category.isActive(),
      updatedAt: category.updatedAt,
    };
  }
}
