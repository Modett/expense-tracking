import type { PrismaClient } from "@prisma/client";
import type { ITagCommandRepository } from "../../domain/repositories/ITagCommandRepository.js";
import type { Tag } from "../../domain/entities/Tag.js";
import type { TagId, TagType } from "../../domain/value-objects/index.js";

export class PrismaTagRepository implements ITagCommandRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(tag: Tag): Promise<void> {
    await this.prisma.tag.create({
      data: {
        tagId: tag.id.getValue(),
        name: tag.getName().getValue(),
        type: tag.getType().getValue(),
        isActive: tag.isActive(),
        createdAt: tag.createdAt,
        updatedAt: tag.updatedAt,
      },
    });
  }

  async update(tag: Tag): Promise<void> {
    await this.prisma.tag.update({
      where: { tagId: tag.id.getValue() },
      data: {
        name: tag.getName().getValue(),
        type: tag.getType().getValue(),
        isActive: tag.isActive(),
        updatedAt: tag.updatedAt,
      },
    });
  }

  async delete(id: TagId): Promise<void> {
    await this.prisma.tag.delete({
      where: { tagId: id.getValue() },
    });
  }

  async existsByNameAndType(name: string, type: TagType): Promise<boolean> {
    const count = await this.prisma.tag.count({
      where: {
        name,
        type: type.getValue(),
      },
    });
    return count > 0;
  }

  async existsByNameAndTypeExcludingId(
    name: string,
    type: TagType,
    excludeId: TagId
  ): Promise<boolean> {
    const count = await this.prisma.tag.count({
      where: {
        name,
        type: type.getValue(),
        tagId: { not: excludeId.getValue() },
      },
    });
    return count > 0;
  }
}
