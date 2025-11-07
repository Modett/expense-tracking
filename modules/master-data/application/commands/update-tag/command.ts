import type { TagTypeValue } from "../../../domain/value-objects/index.js";

export class UpdateTagCommand {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly type: TagTypeValue
  ) {}
}
