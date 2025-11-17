import type {
  IApprovalRuleQueryRepository,
  ApprovalRuleFilters,
} from "../../../domain/repositories/IApprovalRuleQueryRepository.js";
import { CategoryId, ApproverRole } from "../../../domain/index.js";
import type { GetAllApprovalRulesQuery } from "./query.js";

export interface ApprovalRuleDTO {
  ruleId: string;
  categoryId: string;
  minAmount: number;
  approverRole: string;
  approvalOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: any;
}

export class GetAllApprovalRulesQueryHandler {
  constructor(
    private readonly approvalRuleQueryRepo: IApprovalRuleQueryRepository
  ) {}

  async handle(query: GetAllApprovalRulesQuery): Promise<ApprovalRuleDTO[]> {
    const filters: ApprovalRuleFilters = {};

    if (query.categoryId) {
      filters.categoryId = CategoryId.fromString(query.categoryId);
    }

    if (query.approverRole) {
      filters.approverRole = ApproverRole.fromString(query.approverRole);
    }

    if (query.isActive !== undefined) {
      filters.isActive = query.isActive;
    }

    if (query.minAmountGreaterThan !== undefined) {
      filters.minAmountGreaterThan = query.minAmountGreaterThan;
    }

    if (query.minAmountLessThan !== undefined) {
      filters.minAmountLessThan = query.minAmountLessThan;
    }

    const approvalRules = await this.approvalRuleQueryRepo.findAll(filters);

    return approvalRules.map((rule) => {
      const plainObject = rule.toPlainObject();
      return {
        ...plainObject,
        category: (rule as any).category,
      };
    });
  }
}
