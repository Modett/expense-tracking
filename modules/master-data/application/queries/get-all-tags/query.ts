import type { TagTypeValue } from "../../../domain/value-objects/index.js";

export class GetAllTagsQuery {
  constructor(
    public readonly limit?: number,
    public readonly offset?: number,
    public readonly isActive?: boolean,
    public readonly type?: TagTypeValue,
    public readonly searchTerm?: string
  ) {}
}
