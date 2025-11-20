import type { IApprovalRuleCommandRepository } from "../../../domain/repositories/IApprovalRuleCommandRepository.js";
import type { IApprovalRuleQueryRepository } from "../../../domain/repositories/IApprovalRuleQueryRepository.js";
import {
  ApprovalRuleId,
  CategoryId,
  MinAmount,
  ApproverRole,
  ApprovalOrder,
} from "../../../domain/index.js";
import { DepartmentId } from "../../../../master-data/domain/value-objects/index.js";
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

    // Handle category update
    if (command.categoryId !== undefined) {
      const targetCategoryId = command.categoryId
        ? CategoryId.fromString(command.categoryId)
        : null;
      approvalRule.updateCategory(targetCategoryId);
    }

    // Handle department update
    if (command.departmentId !== undefined) {
      const targetDepartmentId = command.departmentId
        ? DepartmentId.fromString(command.departmentId)
        : null;
      approvalRule.updateDepartment(targetDepartmentId);
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
    }

    await this.approvalRuleCommandRepo.save(approvalRule);

    return {
      success: true,
      approvalRuleId: approvalRule.id.getValue(),
    };
  }
}
