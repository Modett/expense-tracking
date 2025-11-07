import type { ITagQueryRepository } from "../../../domain/repositories/ITagQueryRepository.js";
import type { GetAllTagsQuery } from "./query.js";

export interface TagListItemResponse {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetAllTagsResponse {
  tags: TagListItemResponse[];
  total: number;
}

export class GetAllTagsQueryHandler {
  constructor(private readonly tagQueryRepository: ITagQueryRepository) {}

  async handle(query: GetAllTagsQuery): Promise<GetAllTagsResponse> {
    const tags = await this.tagQueryRepository.findAll({
      ...(query.limit !== undefined && { limit: query.limit }),
      ...(query.offset !== undefined && { offset: query.offset }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.type !== undefined && { type: query.type }),
      ...(query.searchTerm !== undefined && { searchTerm: query.searchTerm }),
    });

    const total = await this.tagQueryRepository.count({
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.type !== undefined && { type: query.type }),
    });

    return {
      tags: tags.map((tag) => ({
        id: tag.id.getValue(),
        name: tag.getName().getValue(),
        type: tag.getType().getValue(),
        isActive: tag.isActive(),
        createdAt: tag.createdAt,
        updatedAt: tag.updatedAt,
      })),
      total,
    };
  }
}
