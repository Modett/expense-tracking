import type { IApprovalRuleCommandRepository } from "../../../domain/repositories/IApprovalRuleCommandRepository.js";
import type { IApprovalRuleQueryRepository } from "../../../domain/repositories/IApprovalRuleQueryRepository.js";
import { ApprovalRuleId } from "../../../domain/index.js";
import type { ActivateApprovalRuleCommand } from "./command.js";

export interface ActivateApprovalRuleResponse {
  success: boolean;
  approvalRuleId: string;
}

export class ActivateApprovalRuleCommandHandler {
  constructor(
    private readonly approvalRuleQueryRepo: IApprovalRuleQueryRepository,
    private readonly approvalRuleCommandRepo: IApprovalRuleCommandRepository
  ) {}

  async handle(
    command: ActivateApprovalRuleCommand
  ): Promise<ActivateApprovalRuleResponse> {
    const approvalRuleId = ApprovalRuleId.fromString(command.approvalRuleId);

    const approvalRule = await this.approvalRuleQueryRepo.findById(
      approvalRuleId
    );
    if (!approvalRule) {
      throw new Error(
        `Approval rule with ID ${command.approvalRuleId} not found`
      );
    }

    approvalRule.activate();

    await this.approvalRuleCommandRepo.save(approvalRule);

    return {
      success: true,
      approvalRuleId: approvalRule.id.getValue(),
    };
  }
}
