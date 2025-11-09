import type { IApprovalRuleQueryRepository } from "../../../domain/repositories/IApprovalRuleQueryRepository.js";
import { CategoryId } from "../../../domain/index.js";
import type { GetApprovalRulesByCategoryQuery } from "./query.js";

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

export class GetApprovalRulesByCategoryQueryHandler {
  constructor(
    private readonly approvalRuleQueryRepo: IApprovalRuleQueryRepository
  ) {}

  async handle(query: GetApprovalRulesByCategoryQuery): Promise<ApprovalRuleDTO[]> {
    const categoryId = CategoryId.fromString(query.categoryId);

    const approvalRules = await this.approvalRuleQueryRepo.findByCategory(categoryId);

    return approvalRules.map((rule) => rule.toPlainObject());
  }
}
