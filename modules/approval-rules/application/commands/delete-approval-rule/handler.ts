import type { IApprovalRuleCommandRepository } from "../../../domain/repositories/IApprovalRuleCommandRepository.js";
import type { IApprovalRuleQueryRepository } from "../../../domain/repositories/IApprovalRuleQueryRepository.js";
import type { ApprovalRuleDomainService } from "../../services/ApprovalRuleDomainService.js";
import { ApprovalRuleId } from "../../../domain/index.js";
import type { DeleteApprovalRuleCommand } from "./command.js";

export interface DeleteApprovalRuleResponse {
  success: boolean;
  message: string;
}

export class DeleteApprovalRuleCommandHandler {
  constructor(
    private readonly approvalRuleQueryRepo: IApprovalRuleQueryRepository,
    private readonly approvalRuleCommandRepo: IApprovalRuleCommandRepository,
    private readonly domainService: ApprovalRuleDomainService
  ) {}

  async handle(
    command: DeleteApprovalRuleCommand
  ): Promise<DeleteApprovalRuleResponse> {
    const approvalRuleId = ApprovalRuleId.fromString(command.approvalRuleId);

    const approvalRule = await this.approvalRuleQueryRepo.findById(
      approvalRuleId
    );
    if (!approvalRule) {
      throw new Error(
        `Approval rule with ID ${command.approvalRuleId} not found`
      );
    }

    // Check if the rule can be deleted
    const { canDelete, reason } = await this.domainService.canDeleteRule(
      approvalRuleId,
      approvalRule.categoryId
    );

    if (!canDelete) {
      throw new Error(reason || "Cannot delete approval rule");
    }

    await this.approvalRuleCommandRepo.delete(approvalRuleId);

    return {
      success: true,
      message: `Approval rule ${command.approvalRuleId} deleted successfully`,
    };
  }
}
