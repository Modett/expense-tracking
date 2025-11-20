import type { PrismaClient } from "@prisma/client";
import type { IApprovalRuleCommandRepository } from "../../domain/repositories/IApprovalRuleCommandRepository.js";
import type { ApprovalRule } from "../../domain/entities/ApprovalRule.js";
import type { ApprovalRuleId } from "../../domain/value-objects/index.js";

export class PrismaApprovalRuleCommandRepository implements IApprovalRuleCommandRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(approvalRule: ApprovalRule): Promise<ApprovalRule> {
    const plainObject = approvalRule.toPlainObject();

    await this.prisma.approvalRule.upsert({
      where: { ruleId: plainObject.ruleId },
      create: {
        ruleId: plainObject.ruleId,
        categoryId: plainObject.categoryId,
        departmentId: plainObject.departmentId,
        minAmount: plainObject.minAmount,
        approverRole: plainObject.approverRole,
        approvalOrder: plainObject.approvalOrder,
        isActive: plainObject.isActive,
        createdAt: plainObject.createdAt,
        updatedAt: plainObject.updatedAt,
      },
      update: {
        categoryId: plainObject.categoryId,
        departmentId: plainObject.departmentId,
        minAmount: plainObject.minAmount,
        approverRole: plainObject.approverRole,
        approvalOrder: plainObject.approvalOrder,
        isActive: plainObject.isActive,
        updatedAt: plainObject.updatedAt,
      },
    });

    return approvalRule;
  }

  async saveMany(approvalRules: ApprovalRule[]): Promise<ApprovalRule[]> {
    await this.prisma.$transaction(
      approvalRules.map((approvalRule) => {
        const plainObject = approvalRule.toPlainObject();

        return this.prisma.approvalRule.upsert({
          where: { ruleId: plainObject.ruleId },
          create: {
            ruleId: plainObject.ruleId,
            categoryId: plainObject.categoryId,
            departmentId: plainObject.departmentId,
            minAmount: plainObject.minAmount,
            approverRole: plainObject.approverRole,
            approvalOrder: plainObject.approvalOrder,
            isActive: plainObject.isActive,
            createdAt: plainObject.createdAt,
            updatedAt: plainObject.updatedAt,
          },
          update: {
            categoryId: plainObject.categoryId,
            departmentId: plainObject.departmentId,
            minAmount: plainObject.minAmount,
            approverRole: plainObject.approverRole,
            approvalOrder: plainObject.approvalOrder,
            isActive: plainObject.isActive,
            updatedAt: plainObject.updatedAt,
          },
        });
      })
    );

    return approvalRules;
  }

  async delete(approvalRuleId: ApprovalRuleId): Promise<void> {
    await this.prisma.approvalRule.delete({
      where: { ruleId: approvalRuleId.getValue() },
    });
  }

  async exists(approvalRuleId: ApprovalRuleId): Promise<boolean> {
    const count = await this.prisma.approvalRule.count({
      where: { ruleId: approvalRuleId.getValue() },
    });

    return count > 0;
  }
}
