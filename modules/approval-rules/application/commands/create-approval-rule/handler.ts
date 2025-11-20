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
import { DepartmentId } from "../../../../master-data/domain/value-objects/index.js";
import type { CreateApprovalRuleCommand } from "./command.js";

export interface CreateApprovalRuleResponse {
  success: boolean;
  approvalRuleId: string;
  categoryId: string | null;
  departmentId: string | null;
  minAmount: number;
  approverRole: string;
  approvalOrder: number;
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
    const categoryId = command.categoryId ? CategoryId.fromString(command.categoryId) : null;
    const departmentId = command.departmentId ? DepartmentId.fromString(command.departmentId) : null;
    const minAmount = MinAmount.create(command.minAmount);
    const approverRole = ApproverRole.fromString(command.approverRole);
    const approvalOrder = ApprovalOrder.create(command.approvalOrder);

    // Ensure no duplicate order for this category or department
    if (categoryId) {
      await this.domainService.ensureNoDuplicateOrderForCategory(
        categoryId,
        command.approvalOrder
      );
    }

    const approvalRule = ApprovalRule.create({
      categoryId,
      departmentId,
      minAmount,
      approverRole,
      approvalOrder,
    });

    await this.approvalRuleCommandRepo.save(approvalRule);

    return {
      success: true,
      approvalRuleId: approvalRule.id.getValue(),
      categoryId: approvalRule.categoryId?.getValue() || null,
      departmentId: approvalRule.departmentId?.getValue() || null,
      minAmount: approvalRule.minAmount.getValue(),
      approverRole: approvalRule.approverRole.getValue(),
      approvalOrder: approvalRule.approvalOrder.getValue(),
    };
  }
}
