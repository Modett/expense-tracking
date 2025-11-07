import type { ITagQueryRepository } from "../../../domain/repositories/ITagQueryRepository.js";
import { TagId } from "../../../domain/value-objects/index.js";
import type { GetTagByIdQuery } from "./query.js";

export interface TagResponse {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class GetTagByIdQueryHandler {
  constructor(private readonly tagQueryRepository: ITagQueryRepository) {}

  async handle(query: GetTagByIdQuery): Promise<TagResponse | null> {
    const tagId = TagId.fromString(query.id);
    const tag = await this.tagQueryRepository.findById(tagId);

    if (!tag) {
      return null;
    }

    return {
      id: tag.id.getValue(),
      name: tag.getName().getValue(),
      type: tag.getType().getValue(),
      isActive: tag.isActive(),
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    };
  }
}
