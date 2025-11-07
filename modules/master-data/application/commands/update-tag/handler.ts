import type { ITagCommandRepository } from "../../../domain/repositories/ITagCommandRepository.js";
import type { ITagQueryRepository } from "../../../domain/repositories/ITagQueryRepository.js";
import { TagId, TagName, TagType } from "../../../domain/value-objects/index.js";
import { TagDomainService } from "../../services/TagDomainService.js";
import type { UpdateTagCommand } from "./command.js";

export class UpdateTagCommandHandler {
  constructor(
    private readonly tagCommandRepository: ITagCommandRepository,
    private readonly tagQueryRepository: ITagQueryRepository,
    private readonly tagDomainService: TagDomainService
  ) {}

  async handle(command: UpdateTagCommand): Promise<void> {
    const tagId = TagId.fromString(command.id);
    const name = TagName.create(command.name);
    const type = TagType.create(command.type);

    const tag = await this.tagQueryRepository.findById(tagId);
    if (!tag) {
      throw new Error(`Tag with id ${command.id} not found`);
    }

    await this.tagDomainService.ensureNameAndTypeAreUniqueForUpdate(name, type, tagId);

    tag.update(name, type);

    await this.tagCommandRepository.update(tag);
  }
}
