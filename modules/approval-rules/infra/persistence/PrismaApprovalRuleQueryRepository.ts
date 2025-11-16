import type {
  PrismaClient,
  ApprovalRule as PrismaApprovalRule,
} from "@prisma/client";
import type {
  IApprovalRuleQueryRepository,
  ApprovalRuleFilters,
} from "../../domain/repositories/IApprovalRuleQueryRepository.js";
import { ApprovalRule } from "../../domain/entities/ApprovalRule.js";
import {
  ApprovalRuleId,
  MinAmount,
  ApproverRole,
  ApprovalOrder,
  CategoryId,
} from "../../domain/value-objects/index.js";

export class PrismaApprovalRuleQueryRepository
  implements IApprovalRuleQueryRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(prismaApprovalRule: PrismaApprovalRule): ApprovalRule {
    return ApprovalRule.reconstitute({
      id: ApprovalRuleId.fromString(prismaApprovalRule.ruleId),
      categoryId: CategoryId.fromString(prismaApprovalRule.categoryId),
      minAmount: MinAmount.create(Number(prismaApprovalRule.minAmount)),
      approverRole: ApproverRole.fromString(prismaApprovalRule.approverRole),
      approvalOrder: ApprovalOrder.create(prismaApprovalRule.approvalOrder),
      isActive: prismaApprovalRule.isActive,
      createdAt: prismaApprovalRule.createdAt,
      updatedAt: prismaApprovalRule.updatedAt,
    });
  }

  async findById(approvalRuleId: ApprovalRuleId): Promise<ApprovalRule | null> {
    const approvalRule = await this.prisma.approvalRule.findUnique({
      where: { ruleId: approvalRuleId.getValue() },
    });

    if (!approvalRule) {
      return null;
    }

    return this.toDomain(approvalRule);
  }

  async findByCategory(categoryId: CategoryId): Promise<ApprovalRule[]> {
    const approvalRules = await this.prisma.approvalRule.findMany({
      where: { categoryId: categoryId.getValue() },
      include: {
        category: true,
      },
      orderBy: { approvalOrder: "asc" },
    });

    return approvalRules.map((rule: any) => {
      const domain = this.toDomain(rule);
      (domain as any).category = rule.category;
      return domain;
    });
  }

  async findByApproverRole(
    approverRole: ApproverRole
  ): Promise<ApprovalRule[]> {
    const approvalRules = await this.prisma.approvalRule.findMany({
      where: { approverRole: approverRole.getValue() },
      include: {
        category: true,
      },
      orderBy: { approvalOrder: "asc" },
    });

    return approvalRules.map((rule: any) => {
      const domain = this.toDomain(rule);
      (domain as any).category = rule.category;
      return domain;
    });
  }

  async findActive(): Promise<ApprovalRule[]> {
    const approvalRules = await this.prisma.approvalRule.findMany({
      where: { isActive: true },
      include: {
        category: true,
      },
      orderBy: [{ categoryId: "asc" }, { approvalOrder: "asc" }],
    });

    return approvalRules.map((rule: any) => {
      const domain = this.toDomain(rule);
      (domain as any).category = rule.category;
      return domain;
    });
  }

  async findApplicableRules(
    categoryId: CategoryId,
    amount: number
  ): Promise<ApprovalRule[]> {
    const approvalRules = await this.prisma.approvalRule.findMany({
      where: {
        categoryId: categoryId.getValue(),
        isActive: true,
        minAmount: {
          lte: amount,
        },
      },
      include: {
        category: true,
      },
      orderBy: { approvalOrder: "asc" },
    });

    return approvalRules.map((rule: any) => {
      const domain = this.toDomain(rule);
      (domain as any).category = rule.category;
      return domain;
    });
  }

  async findAll(filters?: ApprovalRuleFilters): Promise<ApprovalRule[]> {
    console.log("Repository findAll called with filters:", filters);
    const where: any = {};

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId.getValue();
    }

    if (filters?.approverRole) {
      where.approverRole = filters.approverRole.getValue();
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.minAmountGreaterThan !== undefined) {
      where.minAmount = {
        ...where.minAmount,
        gt: filters.minAmountGreaterThan,
      };
    }

    if (filters?.minAmountLessThan !== undefined) {
      where.minAmount = {
        ...where.minAmount,
        lt: filters.minAmountLessThan,
      };
    }

    console.log("Prisma query where:", where);
    const approvalRules = await this.prisma.approvalRule.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: [{ categoryId: "asc" }, { approvalOrder: "asc" }],
    });

    console.log("Prisma returned:", approvalRules.length, "rules");
    const mapped = approvalRules.map((rule: any) => {
      const domain = this.toDomain(rule);
      // Attach category for handler to access
      (domain as any).category = rule.category;
      return domain;
    });
    console.log("Mapped to domain:", mapped.length, "rules");
    return mapped;
  }

  async count(filters?: ApprovalRuleFilters): Promise<number> {
    const where: any = {};

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId.getValue();
    }

    if (filters?.approverRole) {
      where.approverRole = filters.approverRole.getValue();
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.minAmountGreaterThan !== undefined) {
      where.minAmount = {
        ...where.minAmount,
        gt: filters.minAmountGreaterThan,
      };
    }

    if (filters?.minAmountLessThan !== undefined) {
      where.minAmount = {
        ...where.minAmount,
        lt: filters.minAmountLessThan,
      };
    }

    return await this.prisma.approvalRule.count({ where });
  }

  async existsByCategoryAndOrder(
    categoryId: CategoryId,
    approvalOrder: number
  ): Promise<boolean> {
    const count = await this.prisma.approvalRule.count({
      where: {
        categoryId: categoryId.getValue(),
        approvalOrder: approvalOrder,
      },
    });

    return count > 0;
  }
}
