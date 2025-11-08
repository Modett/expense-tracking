import type { PrismaClient } from "@prisma/client";
import type { IApprovalCommandRepository } from "../../domain/repositories/IApprovalCommandRepository.js";
import type { Approval } from "../../domain/entities/Approval.js";
import type { ApprovalId } from "../../domain/value-objects/index.js";

export class PrismaApprovalCommandRepository
  implements IApprovalCommandRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async save(approval: Approval): Promise<Approval> {
    const plainObject = approval.toPlainObject();

    await this.prisma.approval.upsert({
      where: { approvalId: plainObject.id },
      create: {
        approvalId: plainObject.id,
        expenseId: plainObject.expenseId,
        approverId: plainObject.approverId,
        status: plainObject.status,
        comments: plainObject.comments,
        approvedAt: plainObject.approvedAt,
        createdAt: plainObject.createdAt,
        updatedAt: plainObject.updatedAt,
      },
      update: {
        status: plainObject.status,
        comments: plainObject.comments,
        approvedAt: plainObject.approvedAt,
        updatedAt: plainObject.updatedAt,
      },
    });

    return approval;
  }

  async saveMany(approvals: Approval[]): Promise<Approval[]> {
    await this.prisma.$transaction(
      approvals.map((approval) => {
        const plainObject = approval.toPlainObject();

        return this.prisma.approval.upsert({
          where: { approvalId: plainObject.id },
          create: {
            approvalId: plainObject.id,
            expenseId: plainObject.expenseId,
            approverId: plainObject.approverId,
            status: plainObject.status,
            comments: plainObject.comments,
            approvedAt: plainObject.approvedAt,
            createdAt: plainObject.createdAt,
            updatedAt: plainObject.updatedAt,
          },
          update: {
            status: plainObject.status,
            comments: plainObject.comments,
            approvedAt: plainObject.approvedAt,
            updatedAt: plainObject.updatedAt,
          },
        });
      })
    );

    return approvals;
  }

  async delete(approvalId: ApprovalId): Promise<void> {
    await this.prisma.approval.delete({
      where: { approvalId: approvalId.getValue() },
    });
  }

  async exists(approvalId: ApprovalId): Promise<boolean> {
    const count = await this.prisma.approval.count({
      where: { approvalId: approvalId.getValue() },
    });

    return count > 0;
  }
}
