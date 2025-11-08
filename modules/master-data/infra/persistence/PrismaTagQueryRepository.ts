import type { PrismaClient, TagTypeEnum } from "@prisma/client";
import type {
  ITagQueryRepository,
  TagListQuery,
} from "../../domain/repositories/ITagQueryRepository.js";
import { Tag } from "../../domain/entities/Tag.js";
import {
  TagId,
  TagName,
  TagType,
  TagStatus,
} from "../../domain/value-objects/index.js";

export class PrismaTagQueryRepository implements ITagQueryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: TagId): Promise<Tag | null> {
    const tag = await this.prisma.tag.findUnique({
      where: { tagId: id.getValue() },
    });

    if (!tag) {
      return null;
    }

    return Tag.fromPersistence(
      TagId.fromString(tag.tagId),
      TagName.create(tag.name),
      TagType.create(tag.type),
      TagStatus.fromBoolean(tag.isActive),
      tag.createdAt,
      tag.updatedAt
    );
  }

  async findAll(query: TagListQuery): Promise<Tag[]> {
    const tags = await this.prisma.tag.findMany({
      where: {
        ...(query.isActive !== undefined && { isActive: query.isActive }),
        ...(query.type !== undefined && { type: query.type }),
        ...(query.searchTerm && {
          name: { contains: query.searchTerm, mode: "insensitive" },
        }),
      },
      ...(query.limit !== undefined && { take: query.limit }),
      ...(query.offset !== undefined && { skip: query.offset }),
      orderBy: { createdAt: "desc" },
    });

    return tags.map((tag) =>
      Tag.fromPersistence(
        TagId.fromString(tag.tagId),
        TagName.create(tag.name),
        TagType.create(tag.type),
        TagStatus.fromBoolean(tag.isActive),
        tag.createdAt,
        tag.updatedAt
      )
    );
  }

  async findByNameAndType(name: string, type: TagType): Promise<Tag | null> {
    const tag = await this.prisma.tag.findFirst({
      where: {
        name,
        type: type.getValue(),
      },
    });

    if (!tag) {
      return null;
    }

    return Tag.fromPersistence(
      TagId.fromString(tag.tagId),
      TagName.create(tag.name),
      TagType.create(tag.type),
      TagStatus.fromBoolean(tag.isActive),
      tag.createdAt,
      tag.updatedAt
    );
  }

  async findByType(
    type: TagType,
    limit?: number,
    offset?: number
  ): Promise<Tag[]> {
    return this.findAll({
      type: type.getValue(),
      ...(limit !== undefined && { limit }),
      ...(offset !== undefined && { offset }),
    });
  }

  async findActiveTags(limit?: number, offset?: number): Promise<Tag[]> {
    return this.findAll({
      isActive: true,
      ...(limit !== undefined && { limit }),
      ...(offset !== undefined && { offset }),
    });
  }

  async searchTags(
    searchTerm: string,
    limit?: number,
    offset?: number
  ): Promise<Tag[]> {
    return this.findAll({
      searchTerm,
      ...(limit !== undefined && { limit }),
      ...(offset !== undefined && { offset }),
    });
  }

  async count(filters?: { isActive?: boolean; type?: string }): Promise<number> {
    const where: {
      isActive?: boolean;
      type?: TagTypeEnum;
    } = {};

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    if (filters?.type !== undefined) {
      where.type = filters.type as TagTypeEnum;
    }

    return this.prisma.tag.count({ where });
  }
}
