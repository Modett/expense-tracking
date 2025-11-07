export type TagTypeValue = 'collection' | 'campaign' | 'custom' | 'department';

export class TagType {
  private static readonly VALID_TYPES: TagTypeValue[] = ['collection', 'campaign', 'custom', 'department'];

  private constructor(private readonly value: TagTypeValue) {
    if (!TagType.VALID_TYPES.includes(value)) {
      throw new Error(
        `Invalid tag type: ${value}. Valid types are: ${TagType.VALID_TYPES.join(', ')}`
      );
    }
  }

  static create(type: TagTypeValue): TagType {
    return new TagType(type);
  }

  static collection(): TagType {
    return new TagType('collection');
  }

  static campaign(): TagType {
    return new TagType('campaign');
  }

  static custom(): TagType {
    return new TagType('custom');
  }

  static department(): TagType {
    return new TagType('department');
  }

  getValue(): TagTypeValue {
    return this.value;
  }

  isCollection(): boolean {
    return this.value === 'collection';
  }

  isCampaign(): boolean {
    return this.value === 'campaign';
  }

  isCustom(): boolean {
    return this.value === 'custom';
  }

  isDepartment(): boolean {
    return this.value === 'department';
  }

  equals(other: TagType): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
