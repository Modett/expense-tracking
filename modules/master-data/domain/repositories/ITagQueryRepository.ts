import type { Tag } from "../entities/Tag.js";
import type { TagId, TagType, TagTypeValue } from "../value-objects/index.js";

export interface TagListQuery {
  limit?: number;
  offset?: number;
  isActive?: boolean;
  type?: TagTypeValue;
  searchTerm?: string;
}

export interface ITagQueryRepository {
  findById(id: TagId): Promise<Tag | null>;
  findAll(query: TagListQuery): Promise<Tag[]>;
  findByNameAndType(name: string, type: TagType): Promise<Tag | null>;
  findByType(type: TagType, limit?: number, offset?: number): Promise<Tag[]>;
  findActiveTags(limit?: number, offset?: number): Promise<Tag[]>;
  searchTags(searchTerm: string, limit?: number, offset?: number): Promise<Tag[]>;
  count(filters?: { isActive?: boolean; type?: TagTypeValue }): Promise<number>;
}
