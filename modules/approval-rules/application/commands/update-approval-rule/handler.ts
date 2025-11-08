import type { IApprovalRuleCommandRepository } from "../../../domain/repositories/IApprovalRuleCommandRepository.js";
import type { IApprovalRuleQueryRepository } from "../../../domain/repositories/IApprovalRuleQueryRepository.js";
import type { ApprovalRuleDomainService } from "../../services/ApprovalRuleDomainService.js";
import {
  ApprovalRuleId,
  MinAmount,
  ApproverRole,
  ApprovalOrder,
} from "../../../domain/index.js";
import type { UpdateApprovalRuleCommand } from "./command.js";

export interface UpdateApprovalRuleResponse {
  success: boolean;
  approvalRuleId: string;
}

export class UpdateApprovalRuleCommandHandler {
  constructor(
    private readonly approvalRuleQueryRepo: IApprovalRuleQueryRepository,
    private readonly approvalRuleCommandRepo: IApprovalRuleCommandRepository,
    private readonly domainService: ApprovalRuleDomainService
  ) {}

  async handle(
    command: UpdateApprovalRuleCommand
  ): Promise<UpdateApprovalRuleResponse> {
    const approvalRuleId = ApprovalRuleId.fromString(command.approvalRuleId);

    const approvalRule = await this.approvalRuleQueryRepo.findById(
      approvalRuleId
    );
    if (!approvalRule) {
      throw new Error(
        `Approval rule with ID ${command.approvalRuleId} not found`
      );
    }

    // Update minimum amount if provided
    if (command.minAmount !== undefined) {
      const minAmount = MinAmount.create(command.minAmount);
      approvalRule.updateMinAmount(minAmount);
    }

    // Update approver role if provided
    if (command.approverRole !== undefined) {
      const approverRole = ApproverRole.fromString(command.approverRole);
      approvalRule.updateApproverRole(approverRole);
    }

    // Update approval order if provided
    if (command.approvalOrder !== undefined) {
      // Ensure no duplicate order for this category (excluding current rule)
      const existingRules = await this.approvalRuleQueryRepo.findByCategory(
        approvalRule.categoryId
      );
      const duplicateOrder = existingRules.find(
        (rule) =>
          rule.approvalOrder.getValue() === command.approvalOrder &&
          !rule.id.equals(approvalRuleId)
      );

      if (duplicateOrder) {
        throw new Error(
          `An approval rule with order ${command.approvalOrder} already exists for this category`
        );
      }

      const approvalOrder = ApprovalOrder.create(command.approvalOrder);
      approvalRule.updateApprovalOrder(approvalOrder);
    }

    await this.approvalRuleCommandRepo.save(approvalRule);

    return {
      success: true,
      approvalRuleId: approvalRule.id.getValue(),
    };
  }
}
