import type { ITagCommandRepository } from "../../../domain/repositories/ITagCommandRepository.js";
import type { ITagQueryRepository } from "../../../domain/repositories/ITagQueryRepository.js";
import { TagId } from "../../../domain/value-objects/index.js";
import type { ActivateTagCommand } from "./command.js";

export class ActivateTagCommandHandler {
  constructor(
    private readonly tagCommandRepository: ITagCommandRepository,
    private readonly tagQueryRepository: ITagQueryRepository
  ) {}

  async handle(command: ActivateTagCommand): Promise<void> {
    const tagId = TagId.fromString(command.id);

    const tag = await this.tagQueryRepository.findById(tagId);
    if (!tag) {
      throw new Error(`Tag with id ${command.id} not found`);
    }

    tag.activate();

    await this.tagCommandRepository.update(tag);
  }
}
