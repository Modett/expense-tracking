export enum ApproverRoleEnum {
  STAFF = "STAFF",
  MANAGER = "MANAGER",
  FINANCE = "FINANCE",
  ADMIN = "ADMIN",
}

export interface ApprovalRule {
  ruleId: string;
  categoryId: string | null;
  departmentId: string | null;
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
  department?: {
    departmentId: string;
    name: string;
    code?: string;
    description?: string;
  };
}

export interface CreateApprovalRuleRequest {
  categoryId?: string | null;
  departmentId?: string | null;
  minAmount: number;
  approverRole: ApproverRoleEnum | `${ApproverRoleEnum}`;
  approvalOrder: number;
}

export interface UpdateApprovalRuleRequest {
  categoryId?: string | null;
  departmentId?: string | null;
  minAmount?: number;
  approverRole?: ApproverRoleEnum;
  approvalOrder?: number;
}

export interface GetAllApprovalRulesParams {
  categoryId?: string;
  departmentId?: string;
  approverRole?: ApproverRoleEnum;
  isActive?: boolean;
  minAmountGreaterThan?: number;
  minAmountLessThan?: number;
}

export interface CreateApprovalRuleResponse {
  success: boolean;
  approvalRuleId: string;
  categoryId: string | null;
  departmentId: string | null;
  minAmount: number;
  approverRole: string;
  approvalOrder: number;
}
