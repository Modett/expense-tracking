import type { ICategoryQueryRepository } from "../../../domain/repositories/ICategoryQueryRepository.js";
import { CategoryId } from "../../../domain/value-objects/index.js";
import type { GetCategoryByIdQuery } from "./query.js";

export interface CategoryResponse {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class GetCategoryByIdQueryHandler {
  constructor(private readonly categoryQueryRepository: ICategoryQueryRepository) {}

  async handle(query: GetCategoryByIdQuery): Promise<CategoryResponse | null> {
    const categoryId = CategoryId.fromString(query.id);
    const category = await this.categoryQueryRepository.findById(categoryId);

    if (!category) {
      return null;
    }

    return {
      id: category.id.getValue(),
      name: category.getName().getValue(),
      description: category.getDescription().getValue(),
      isActive: category.isActive(),
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
