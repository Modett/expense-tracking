import type { IApprovalRuleCommandRepository } from "../../../domain/repositories/IApprovalRuleCommandRepository.js";
import type { IApprovalRuleQueryRepository } from "../../../domain/repositories/IApprovalRuleQueryRepository.js";
import {
  ApprovalRuleId,
  CategoryId,
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
    private readonly approvalRuleCommandRepo: IApprovalRuleCommandRepository
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

    const targetCategoryId = command.categoryId
      ? CategoryId.fromString(command.categoryId)
      : approvalRule.categoryId;

    const desiredApprovalOrder =
      command.approvalOrder ?? approvalRule.approvalOrder.getValue();

    const existingRules = await this.approvalRuleQueryRepo.findByCategory(
      targetCategoryId
    );
    const duplicateOrder = existingRules.find(
      (rule) =>
        rule.approvalOrder.getValue() === desiredApprovalOrder &&
        !rule.id.equals(approvalRuleId)
    );

    if (duplicateOrder) {
      throw new Error(
        `An approval rule with order ${desiredApprovalOrder} already exists for this category`
      );
    }

    if (command.categoryId) {
      approvalRule.updateCategory(targetCategoryId);
    }

    if (command.minAmount !== undefined) {
      const minAmount = MinAmount.create(command.minAmount);
      approvalRule.updateMinAmount(minAmount);
    }

    if (command.approverRole !== undefined) {
      const approverRole = ApproverRole.fromString(command.approverRole);
      approvalRule.updateApproverRole(approverRole);
    }

    if (command.approvalOrder !== undefined) {
      const approvalOrder = ApprovalOrder.create(command.approvalOrder);
      approvalRule.updateApprovalOrder(approvalOrder);
    } else if (command.categoryId) {
      // ensure approval order remains valid within new category
      const approvalOrder = ApprovalOrder.create(desiredApprovalOrder);
      approvalRule.updateApprovalOrder(approvalOrder);
    }

    await this.approvalRuleCommandRepo.save(approvalRule);

    return {
      success: true,
      approvalRuleId: approvalRule.id.getValue(),
    };
  }
}
