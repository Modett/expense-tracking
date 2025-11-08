import type { IApprovalRuleCommandRepository } from "../../../domain/repositories/IApprovalRuleCommandRepository.js";
import type { IApprovalRuleQueryRepository } from "../../../domain/repositories/IApprovalRuleQueryRepository.js";
import type { ApprovalRuleDomainService } from "../../services/ApprovalRuleDomainService.js";
import {
  ApprovalRule,
  CategoryId,
  MinAmount,
  ApproverRole,
  ApprovalOrder,
} from "../../../domain/index.js";
import type { CreateApprovalRuleCommand } from "./command.js";

export interface CreateApprovalRuleResponse {
  success: boolean;
  approvalRuleId: string;
}

export class CreateApprovalRuleCommandHandler {
  constructor(
    private readonly approvalRuleQueryRepo: IApprovalRuleQueryRepository,
    private readonly approvalRuleCommandRepo: IApprovalRuleCommandRepository,
    private readonly domainService: ApprovalRuleDomainService
  ) {}

  async handle(
    command: CreateApprovalRuleCommand
  ): Promise<CreateApprovalRuleResponse> {
    const categoryId = CategoryId.fromString(command.categoryId);
    const minAmount = MinAmount.create(command.minAmount);
    const approverRole = ApproverRole.fromString(command.approverRole);
    const approvalOrder = ApprovalOrder.create(command.approvalOrder);

    // Ensure no duplicate order for this category
    await this.domainService.ensureNoDuplicateOrderForCategory(
      categoryId,
      command.approvalOrder
    );

    const approvalRule = ApprovalRule.create({
      categoryId,
      minAmount,
      approverRole,
      approvalOrder,
    });

    await this.approvalRuleCommandRepo.save(approvalRule);

    return {
      success: true,
      approvalRuleId: approvalRule.id.getValue(),
    };
  }
}
