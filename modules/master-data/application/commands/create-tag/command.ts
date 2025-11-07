import type { TagTypeValue } from "../../../domain/value-objects/index.js";

export class CreateTagCommand {
  constructor(
    public readonly name: string,
    public readonly type: TagTypeValue
  ) {}
}
