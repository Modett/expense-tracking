import type { ITagCommandRepository } from "../../domain/repositories/ITagCommandRepository.js";
import type { TagId, TagName, TagType } from "../../domain/value-objects/index.js";

export class TagDomainService {
  constructor(private readonly tagRepository: ITagCommandRepository) {}

  async ensureNameAndTypeAreUnique(name: TagName, type: TagType): Promise<void> {
    const exists = await this.tagRepository.existsByNameAndType(name.getValue(), type);
    if (exists) {
      throw new Error(
        `Tag with name "${name.getValue()}" and type "${type.getValue()}" already exists`
      );
    }
  }

  async ensureNameAndTypeAreUniqueForUpdate(
    name: TagName,
    type: TagType,
    currentTagId: TagId
  ): Promise<void> {
    const exists = await this.tagRepository.existsByNameAndTypeExcludingId(
      name.getValue(),
      type,
      currentTagId
    );
    if (exists) {
      throw new Error(
        `Tag with name "${name.getValue()}" and type "${type.getValue()}" already exists`
      );
    }
  }
}
