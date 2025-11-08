import { ApprovalRule } from "../entities/ApprovalRule.js";
import {
  ApprovalRuleId,
  CategoryId,
  ApproverRole,
} from "../value-objects/index.js";

export interface ApprovalRuleFilters {
  categoryId?: CategoryId;
  approverRole?: ApproverRole;
  isActive?: boolean;
  minAmountGreaterThan?: number;
  minAmountLessThan?: number;
}

export interface IApprovalRuleQueryRepository {
  findById(approvalRuleId: ApprovalRuleId): Promise<ApprovalRule | null>;
  findByCategory(categoryId: CategoryId): Promise<ApprovalRule[]>;
  findByApproverRole(approverRole: ApproverRole): Promise<ApprovalRule[]>;
  findActive(): Promise<ApprovalRule[]>;
  findApplicableRules(
    categoryId: CategoryId,
    amount: number
  ): Promise<ApprovalRule[]>;
  findAll(filters?: ApprovalRuleFilters): Promise<ApprovalRule[]>;
  count(filters?: ApprovalRuleFilters): Promise<number>;
  existsByCategoryAndOrder(
    categoryId: CategoryId,
    approvalOrder: number
  ): Promise<boolean>;
}
