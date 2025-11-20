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
import { DepartmentId } from "../../../master-data/domain/value-objects/index.js";

export class PrismaApprovalRuleQueryRepository
  implements IApprovalRuleQueryRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(prismaApprovalRule: PrismaApprovalRule): ApprovalRule {
    return ApprovalRule.reconstitute({
      id: ApprovalRuleId.fromString(prismaApprovalRule.ruleId),
      categoryId: prismaApprovalRule.categoryId ? CategoryId.fromString(prismaApprovalRule.categoryId) : null,
      departmentId: prismaApprovalRule.departmentId ? DepartmentId.fromString(prismaApprovalRule.departmentId) : null,
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
        department: true,
      },
      orderBy: { approvalOrder: "asc" },
    });

    return approvalRules.map((rule: any) => {
      const domain = this.toDomain(rule);
      (domain as any).category = rule.category;
      (domain as any).department = rule.department;
      return domain;
    });
  }

  async findByDepartment(departmentId: DepartmentId): Promise<ApprovalRule[]> {
    const approvalRules = await this.prisma.approvalRule.findMany({
      where: { departmentId: departmentId.getValue() },
      include: {
        category: true,
        department: true,
      },
      orderBy: { approvalOrder: "asc" },
    });

    return approvalRules.map((rule: any) => {
      const domain = this.toDomain(rule);
      (domain as any).category = rule.category;
      (domain as any).department = rule.department;
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
    categoryId: CategoryId | null,
    departmentId: DepartmentId | null,
    amount: number
  ): Promise<ApprovalRule[]> {
    const baseWhere: any = {
      isActive: true,
      minAmount: {
        lte: amount,
      },
    };

    const scopeConditions: any[] = [];

    if (categoryId) {
      scopeConditions.push({ categoryId: categoryId.getValue() });
    }

    if (departmentId) {
      scopeConditions.push({ departmentId: departmentId.getValue() });
    }

    // Always include global rules (no category/department) in consideration
    scopeConditions.push({ categoryId: null, departmentId: null });

    const approvalRules = await this.prisma.approvalRule.findMany({
      where: {
        ...baseWhere,
        ...(scopeConditions.length > 0 ? { OR: scopeConditions } : {}),
      },
      include: {
        category: true,
        department: true,
      },
      orderBy: { approvalOrder: "asc" },
    });

    const mappedRules = approvalRules.map((rule: any) => {
      const domain = this.toDomain(rule);
      (domain as any).category = rule.category;
      (domain as any).department = rule.department;
      return domain;
    });

    const applicableRules = mappedRules.filter((rule) =>
      rule.appliesTo(categoryId, departmentId, amount)
    );

    if (applicableRules.length <= 1) {
      return applicableRules;
    }

    const getSpecificityScore = (rule: ApprovalRule): number => {
      const hasCategoryScope = rule.categoryId !== null;
      const hasDepartmentScope = rule.departmentId !== null;

      if (hasCategoryScope && hasDepartmentScope) return 3;
      if (hasCategoryScope) return 2;
      if (hasDepartmentScope) return 1;
      return 0;
    };

    const highestSpecificity = Math.max(
      ...applicableRules.map(getSpecificityScore)
    );

    return applicableRules.filter(
      (rule) => getSpecificityScore(rule) === highestSpecificity
    );
  }

  async findAll(filters?: ApprovalRuleFilters): Promise<ApprovalRule[]> {
    console.log("Repository findAll called with filters:", filters);
    const where: any = {};

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId.getValue();
    }

    if (filters?.departmentId) {
      where.departmentId = filters.departmentId.getValue();
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
        department: true,
      },
      orderBy: [{ categoryId: "asc" }, { departmentId: "asc" }, { approvalOrder: "asc" }],
    });

    console.log("Prisma returned:", approvalRules.length, "rules");
    const mapped = approvalRules.map((rule: any) => {
      const domain = this.toDomain(rule);
      // Attach category and department for handler to access
      (domain as any).category = rule.category;
      (domain as any).department = rule.department;
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

    if (filters?.departmentId) {
      where.departmentId = filters.departmentId.getValue();
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

  async existsByDepartmentAndOrder(
    departmentId: DepartmentId,
    approvalOrder: number
  ): Promise<boolean> {
    const count = await this.prisma.approvalRule.count({
      where: {
        departmentId: departmentId.getValue(),
        approvalOrder: approvalOrder,
      },
    });

    return count > 0;
  }
}
