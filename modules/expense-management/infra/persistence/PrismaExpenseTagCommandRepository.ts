import type { PrismaClient } from "@prisma/client";
import type { IExpenseTagCommandRepository } from "../../domain/repositories/IExpenseTagCommandRepository.js";
import type { ExpenseTag } from "../../domain/entities/ExpenseTag.js";
import type { ExpenseId, TagId } from "../../domain/value-objects/index.js";

export class PrismaExpenseTagCommandRepository
  implements IExpenseTagCommandRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async add(expenseTag: ExpenseTag): Promise<ExpenseTag> {
    await this.prisma.expenseTag.create({
      data: {
        expenseId: expenseTag.expenseId.getValue(),
        tagId: expenseTag.tagId.getValue(),
        createdAt: expenseTag.createdAt,
      },
    });

    return expenseTag;
  }

  async addMany(expenseTags: ExpenseTag[]): Promise<ExpenseTag[]> {
    await this.prisma.expenseTag.createMany({
      data: expenseTags.map((et) => ({
        expenseId: et.expenseId.getValue(),
        tagId: et.tagId.getValue(),
        createdAt: et.createdAt,
      })),
      skipDuplicates: true,
    });

    return expenseTags;
  }

  async remove(expenseId: ExpenseId, tagId: TagId): Promise<void> {
    await this.prisma.expenseTag.delete({
      where: {
        expenseId_tagId: {
          expenseId: expenseId.getValue(),
          tagId: tagId.getValue(),
        },
      },
    });
  }

  async removeMany(
    relationships: Array<{ expenseId: ExpenseId; tagId: TagId }>
  ): Promise<void> {
    await this.prisma.expenseTag.deleteMany({
      where: {
        OR: relationships.map((rel) => ({
          expenseId: rel.expenseId.getValue(),
          tagId: rel.tagId.getValue(),
        })),
      },
    });
  }

  async removeAllForExpense(expenseId: ExpenseId): Promise<void> {
    await this.prisma.expenseTag.deleteMany({
      where: {
        expenseId: expenseId.getValue(),
      },
    });
  }

  async removeAllForExpenses(expenseIds: ExpenseId[]): Promise<void> {
    await this.prisma.expenseTag.deleteMany({
      where: {
        expenseId: {
          in: expenseIds.map((id) => id.getValue()),
        },
      },
    });
  }

  async removeTagFromAllExpenses(tagId: TagId): Promise<void> {
    await this.prisma.expenseTag.deleteMany({
      where: {
        tagId: tagId.getValue(),
      },
    });
  }
}
