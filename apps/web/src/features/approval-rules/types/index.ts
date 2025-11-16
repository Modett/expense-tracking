export enum ApproverRoleEnum {
  STAFF = "STAFF",
  MANAGER = "MANAGER",
  FINANCE = "FINANCE",
  ADMIN = "ADMIN",
}

export interface ApprovalRule {
  ruleId: string;
  categoryId: string;
  minAmount: number;
  approverRole: ApproverRoleEnum | `${ApproverRoleEnum}`;
  approvalOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: {
    categoryId: string;
    name: string;
    description?: string;
  };
}

export interface CreateApprovalRuleRequest {
  categoryId: string;
  minAmount: number;
  approverRole: ApproverRoleEnum | `${ApproverRoleEnum}`;
  approvalOrder: number;
}

export interface UpdateApprovalRuleRequest {
  minAmount?: number;
  approverRole?: ApproverRoleEnum;
  approvalOrder?: number;
}

export interface GetAllApprovalRulesParams {
  categoryId?: string;
  approverRole?: ApproverRoleEnum;
  isActive?: boolean;
  minAmountGreaterThan?: number;
  minAmountLessThan?: number;
}

export interface CreateApprovalRuleResponse {
  success: boolean;
  approvalRuleId: string;
  categoryId: string;
  minAmount: number;
  approverRole: string;
  approvalOrder: number;
}
