import type { PrismaClient, ApprovalRule as PrismaApprovalRule } from "@prisma/client";
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

export class PrismaApprovalRuleQueryRepository implements IApprovalRuleQueryRepository {
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
      orderBy: { approvalOrder: "asc" },
    });

    return approvalRules.map((rule) => this.toDomain(rule));
  }

  async findByApproverRole(approverRole: ApproverRole): Promise<ApprovalRule[]> {
    const approvalRules = await this.prisma.approvalRule.findMany({
      where: { approverRole: approverRole.getValue() },
      orderBy: { approvalOrder: "asc" },
    });

    return approvalRules.map((rule) => this.toDomain(rule));
  }

  async findActive(): Promise<ApprovalRule[]> {
    const approvalRules = await this.prisma.approvalRule.findMany({
      where: { isActive: true },
      orderBy: [{ categoryId: "asc" }, { approvalOrder: "asc" }],
    });

    return approvalRules.map((rule) => this.toDomain(rule));
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
      orderBy: { approvalOrder: "asc" },
    });

    return approvalRules.map((rule) => this.toDomain(rule));
  }

  async findAll(filters?: ApprovalRuleFilters): Promise<ApprovalRule[]> {
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

    const approvalRules = await this.prisma.approvalRule.findMany({
      where,
      orderBy: [{ categoryId: "asc" }, { approvalOrder: "asc" }],
    });

    return approvalRules.map((rule) => this.toDomain(rule));
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
