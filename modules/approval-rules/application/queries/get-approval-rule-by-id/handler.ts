import type { IApprovalRuleQueryRepository } from "../../../domain/repositories/IApprovalRuleQueryRepository.js";
import { ApprovalRuleId } from "../../../domain/index.js";
import type { GetApprovalRuleByIdQuery } from "./query.js";

export interface ApprovalRuleDTO {
  id: string;
  categoryId: string;
  minAmount: number;
  approverRole: string;
  approvalOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class GetApprovalRuleByIdQueryHandler {
  constructor(
    private readonly approvalRuleQueryRepo: IApprovalRuleQueryRepository
  ) {}

  async handle(query: GetApprovalRuleByIdQuery): Promise<ApprovalRuleDTO | null> {
    const approvalRuleId = ApprovalRuleId.fromString(query.approvalRuleId);

    const approvalRule = await this.approvalRuleQueryRepo.findById(approvalRuleId);

    if (!approvalRule) {
      return null;
    }

    return approvalRule.toPlainObject();
  }
}
