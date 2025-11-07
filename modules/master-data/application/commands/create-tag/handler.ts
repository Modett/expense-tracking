import type { ITagCommandRepository } from "../../../domain/repositories/ITagCommandRepository.js";
import { Tag } from "../../../domain/entities/Tag.js";
import { TagName, TagType } from "../../../domain/value-objects/index.js";
import { TagDomainService } from "../../services/TagDomainService.js";
import type { CreateTagCommand } from "./command.js";

export interface CreateTagResponse {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  createdAt: Date;
}

export class CreateTagCommandHandler {
  constructor(
    private readonly tagRepository: ITagCommandRepository,
    private readonly tagDomainService: TagDomainService
  ) {}

  async handle(command: CreateTagCommand): Promise<CreateTagResponse> {
    const name = TagName.create(command.name);
    const type = TagType.create(command.type);

    await this.tagDomainService.ensureNameAndTypeAreUnique(name, type);

    const tag = Tag.create(name, type);

    await this.tagRepository.save(tag);

    return {
      id: tag.id.getValue(),
      name: tag.getName().getValue(),
      type: tag.getType().getValue(),
      isActive: tag.isActive(),
      createdAt: tag.createdAt,
    };
  }
}
