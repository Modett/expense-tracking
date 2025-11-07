import type { PrismaClient } from "@prisma/client";
import type { IExpenseTagQueryRepository } from "../../domain/repositories/IExpenseTagQueryRepository.js";
import { ExpenseTag } from "../../domain/entities/ExpenseTag.js";
import { ExpenseId, TagId } from "../../domain/value-objects/index.js";

export class PrismaExpenseTagQueryRepository
  implements IExpenseTagQueryRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async findByExpenseId(expenseId: ExpenseId): Promise<ExpenseTag[]> {
    const expenseTags = await this.prisma.expenseTag.findMany({
      where: {
        expenseId: expenseId.getValue(),
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return expenseTags.map((et) =>
      ExpenseTag.reconstitute({
        expenseId: ExpenseId.fromString(et.expenseId),
        tagId: TagId.fromString(et.tagId),
        createdAt: et.createdAt,
      })
    );
  }

  async findByTagId(tagId: TagId): Promise<ExpenseTag[]> {
    const expenseTags = await this.prisma.expenseTag.findMany({
      where: {
        tagId: tagId.getValue(),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return expenseTags.map((et) =>
      ExpenseTag.reconstitute({
        expenseId: ExpenseId.fromString(et.expenseId),
        tagId: TagId.fromString(et.tagId),
        createdAt: et.createdAt,
      })
    );
  }

  async findByExpenseIds(expenseIds: ExpenseId[]): Promise<ExpenseTag[]> {
    const expenseTags = await this.prisma.expenseTag.findMany({
      where: {
        expenseId: {
          in: expenseIds.map((id) => id.getValue()),
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return expenseTags.map((et) =>
      ExpenseTag.reconstitute({
        expenseId: ExpenseId.fromString(et.expenseId),
        tagId: TagId.fromString(et.tagId),
        createdAt: et.createdAt,
      })
    );
  }

  async findByTagIds(tagIds: TagId[]): Promise<ExpenseTag[]> {
    const expenseTags = await this.prisma.expenseTag.findMany({
      where: {
        tagId: {
          in: tagIds.map((id) => id.getValue()),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return expenseTags.map((et) =>
      ExpenseTag.reconstitute({
        expenseId: ExpenseId.fromString(et.expenseId),
        tagId: TagId.fromString(et.tagId),
        createdAt: et.createdAt,
      })
    );
  }

  async findExpensesByAllTags(tagIds: TagId[]): Promise<ExpenseId[]> {
    if (tagIds.length === 0) {
      return [];
    }

    const tagIdStrings = tagIds.map((id) => id.getValue());

    const result = await this.prisma.$queryRaw<Array<{ expenseId: string }>>`
      SELECT expense_id as "expenseId"
      FROM expense_tags
      WHERE tag_id = ANY(${tagIdStrings}::uuid[])
      GROUP BY expense_id
      HAVING COUNT(DISTINCT tag_id) = ${tagIds.length}
    `;

    return result.map((row) => ExpenseId.fromString(row.expenseId));
  }

  async exists(expenseId: ExpenseId, tagId: TagId): Promise<boolean> {
    const count = await this.prisma.expenseTag.count({
      where: {
        expenseId: expenseId.getValue(),
        tagId: tagId.getValue(),
      },
    });

    return count > 0;
  }

  async existsMany(
    relationships: Array<{ expenseId: ExpenseId; tagId: TagId }>
  ): Promise<Map<string, boolean>> {
    const result = new Map<string, boolean>();

    const expenseTags = await this.prisma.expenseTag.findMany({
      where: {
        OR: relationships.map((rel) => ({
          expenseId: rel.expenseId.getValue(),
          tagId: rel.tagId.getValue(),
        })),
      },
      select: {
        expenseId: true,
        tagId: true,
      },
    });

    const existingSet = new Set(
      expenseTags.map((et) => `${et.expenseId}_${et.tagId}`)
    );

    for (const rel of relationships) {
      const key = `${rel.expenseId.getValue()}_${rel.tagId.getValue()}`;
      result.set(key, existingSet.has(key));
    }

    return result;
  }

  async hasAnyTags(expenseId: ExpenseId): Promise<boolean> {
    const count = await this.prisma.expenseTag.count({
      where: {
        expenseId: expenseId.getValue(),
      },
    });

    return count > 0;
  }

  async countByExpenseId(expenseId: ExpenseId): Promise<number> {
    return this.prisma.expenseTag.count({
      where: {
        expenseId: expenseId.getValue(),
      },
    });
  }

  async countByTagId(tagId: TagId): Promise<number> {
    return this.prisma.expenseTag.count({
      where: {
        tagId: tagId.getValue(),
      },
    });
  }

  async findUniqueTagIdsByExpenses(expenseIds: ExpenseId[]): Promise<TagId[]> {
    if (expenseIds.length === 0) {
      return [];
    }

    const result = await this.prisma.expenseTag.findMany({
      where: {
        expenseId: {
          in: expenseIds.map((id) => id.getValue()),
        },
      },
      select: {
        tagId: true,
      },
      distinct: ["tagId"],
    });

    return result.map((et) => TagId.fromString(et.tagId));
  }
}
