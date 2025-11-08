import { Approval } from "../entities/Approval.js";
import { ApprovalId } from "../value-objects/index.js";

export interface IApprovalCommandRepository {
  save(approval: Approval): Promise<Approval>;
  delete(approvalId: ApprovalId): Promise<void>;
  exists(approvalId: ApprovalId): Promise<boolean>;
  saveMany(approvals: Approval[]): Promise<Approval[]>;
}
