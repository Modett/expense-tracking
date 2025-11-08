import { ApprovalRule } from "../entities/ApprovalRule.js";
import { ApprovalRuleId } from "../value-objects/index.js";

export interface IApprovalRuleCommandRepository {
  save(approvalRule: ApprovalRule): Promise<ApprovalRule>;
  delete(approvalRuleId: ApprovalRuleId): Promise<void>;
  exists(approvalRuleId: ApprovalRuleId): Promise<boolean>;
  saveMany(approvalRules: ApprovalRule[]): Promise<ApprovalRule[]>;
}
