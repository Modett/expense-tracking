import type { ICategoryCommandRepository } from "../../../domain/repositories/ICategoryCommandRepository.js";
import { Category } from "../../../domain/entities/Category.js";
import { CategoryName } from "../../../domain/value-objects/index.js";
import { CategoryDomainService } from "../../services/CategoryDomainService.js";
import type { CreateCategoryCommand } from "./command.js";

export interface CreateCategoryResponse {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
}

export class CreateCategoryCommandHandler {
  constructor(
    private readonly categoryRepository: ICategoryCommandRepository,
    private readonly categoryDomainService: CategoryDomainService
  ) {}

  async handle(command: CreateCategoryCommand): Promise<CreateCategoryResponse> {
    const name = CategoryName.create(command.name);

    await this.categoryDomainService.ensureNameIsUnique(name);

    const category = Category.create(name, command.description);

    await this.categoryRepository.save(category);

    return {
      id: category.id.getValue(),
      name: category.getName().getValue(),
      description: category.getDescription().getValue(),
      isActive: category.isActive(),
      createdAt: category.createdAt,
    };
  }
}
