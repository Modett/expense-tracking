import { ApprovalRule } from "../entities/ApprovalRule.js";
import {
  ApprovalRuleId,
  CategoryId,
  ApproverRole,
} from "../value-objects/index.js";
import { DepartmentId } from "../../../master-data/domain/value-objects/index.js";

export interface ApprovalRuleFilters {
  categoryId?: CategoryId;
  departmentId?: DepartmentId;
  approverRole?: ApproverRole;
  isActive?: boolean;
  minAmountGreaterThan?: number;
  minAmountLessThan?: number;
}

export interface IApprovalRuleQueryRepository {
  findById(approvalRuleId: ApprovalRuleId): Promise<ApprovalRule | null>;
  findByCategory(categoryId: CategoryId): Promise<ApprovalRule[]>;
  findByDepartment(departmentId: DepartmentId): Promise<ApprovalRule[]>;
  findByApproverRole(approverRole: ApproverRole): Promise<ApprovalRule[]>;
  findActive(): Promise<ApprovalRule[]>;
  findApplicableRules(
    categoryId: CategoryId | null,
    departmentId: DepartmentId | null,
    amount: number
  ): Promise<ApprovalRule[]>;
  findAll(filters?: ApprovalRuleFilters): Promise<ApprovalRule[]>;
  count(filters?: ApprovalRuleFilters): Promise<number>;
  existsByCategoryAndOrder(
    categoryId: CategoryId,
    approvalOrder: number
  ): Promise<boolean>;
  existsByDepartmentAndOrder(
    departmentId: DepartmentId,
    approvalOrder: number
  ): Promise<boolean>;
}
