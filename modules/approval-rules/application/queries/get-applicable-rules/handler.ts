import type { IApprovalRuleQueryRepository } from "../../../domain/repositories/IApprovalRuleQueryRepository.js";
import { CategoryId } from "../../../domain/index.js";
import type { GetApplicableRulesQuery } from "./query.js";

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

export class GetApplicableRulesQueryHandler {
  constructor(
    private readonly approvalRuleQueryRepo: IApprovalRuleQueryRepository
  ) {}

  async handle(query: GetApplicableRulesQuery): Promise<ApprovalRuleDTO[]> {
    const categoryId = CategoryId.fromString(query.categoryId);

    const approvalRules = await this.approvalRuleQueryRepo.findApplicableRules(
      categoryId,
      query.amount
    );

    // Sort by approval order (ascending) to get the correct approval chain
    const sortedRules = approvalRules.sort((a, b) => {
      return a.approvalOrder.getValue() - b.approvalOrder.getValue();
    });

    return sortedRules.map((rule) => rule.toPlainObject());
  }
}
