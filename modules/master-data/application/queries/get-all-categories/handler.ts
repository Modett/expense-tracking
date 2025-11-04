import type { ICategoryQueryRepository } from "../../../domain/repositories/ICategoryQueryRepository.js";
import type { GetAllCategoriesQuery } from "./query.js";

export interface CategoryListItemResponse {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetAllCategoriesResponse {
  categories: CategoryListItemResponse[];
  total: number;
}

export class GetAllCategoriesQueryHandler {
  constructor(private readonly categoryQueryRepository: ICategoryQueryRepository) {}

  async handle(query: GetAllCategoriesQuery): Promise<GetAllCategoriesResponse> {
    const categories = await this.categoryQueryRepository.findAll({
      ...(query.limit !== undefined && { limit: query.limit }),
      ...(query.offset !== undefined && { offset: query.offset }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.searchTerm !== undefined && { searchTerm: query.searchTerm }),
    });

    const total = await this.categoryQueryRepository.count({
      ...(query.isActive !== undefined && { isActive: query.isActive }),
    });

    return {
      categories: categories.map((category) => ({
        id: category.id.getValue(),
        name: category.getName().getValue(),
        description: category.getDescription().getValue(),
        isActive: category.isActive(),
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      })),
      total,
    };
  }
}
