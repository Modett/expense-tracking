import type { IApprovalRuleQueryRepository } from "../../../domain/repositories/IApprovalRuleQueryRepository.js";
import { DepartmentId } from "../../../../master-data/domain/value-objects/index.js";
import type { GetApprovalRulesByDepartmentQuery } from "./query.js";

export interface ApprovalRuleDTO {
  id: string;
  categoryId: string | null;
  departmentId: string | null;
  minAmount: number;
  approverRole: string;
  approvalOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class GetApprovalRulesByDepartmentQueryHandler {
  constructor(
    private readonly approvalRuleQueryRepo: IApprovalRuleQueryRepository
  ) {}

  async handle(query: GetApprovalRulesByDepartmentQuery): Promise<ApprovalRuleDTO[]> {
    const departmentId = DepartmentId.fromString(query.departmentId);

    const approvalRules = await this.approvalRuleQueryRepo.findByDepartment(departmentId);

    return approvalRules.map((rule) => rule.toPlainObject());
  }
}
