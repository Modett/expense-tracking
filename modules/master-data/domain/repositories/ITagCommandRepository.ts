import type { Tag } from "../entities/Tag.js";
import type { TagId, TagType } from "../value-objects/index.js";

export interface ITagCommandRepository {
  save(tag: Tag): Promise<void>;
  update(tag: Tag): Promise<void>;
  delete(id: TagId): Promise<void>;
  existsByNameAndType(name: string, type: TagType): Promise<boolean>;
  existsByNameAndTypeExcludingId(name: string, type: TagType, excludeId: TagId): Promise<boolean>;
}
