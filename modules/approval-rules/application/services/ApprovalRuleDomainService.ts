import type { IApprovalRuleQueryRepository } from "../../domain/repositories/IApprovalRuleQueryRepository.js";
import type {
  ApprovalRuleId,
  CategoryId,
  ApprovalOrder,
} from "../../domain/value-objects/index.js";
import { ApprovalRule } from "../../domain/entities/ApprovalRule.js";

export class ApprovalRuleDomainService {
  constructor(
    private readonly approvalRuleQueryRepo: IApprovalRuleQueryRepository
  ) {}

  async ensureRuleExists(approvalRuleId: ApprovalRuleId): Promise<void> {
    const rule = await this.approvalRuleQueryRepo.findById(approvalRuleId);
    if (!rule) {
      throw new Error("Approval rule does not exist");
    }
  }

  async ensureRuleDoesNotExist(approvalRuleId: ApprovalRuleId): Promise<void> {
    const rule = await this.approvalRuleQueryRepo.findById(approvalRuleId);
    if (rule) {
      throw new Error("Approval rule already exists");
    }
  }

  async ensureNoDuplicateOrderForCategory(
    categoryId: CategoryId,
    approvalOrder: number
  ): Promise<void> {
    const exists = await this.approvalRuleQueryRepo.existsByCategoryAndOrder(
      categoryId,
      approvalOrder
    );
    if (exists) {
      throw new Error(
        `An approval rule with order ${approvalOrder} already exists for this category`
      );
    }
  }

  async evaluateApplicableRules(
    categoryId: CategoryId,
    amount: number
  ): Promise<ApprovalRule[]> {
    const applicableRules =
      await this.approvalRuleQueryRepo.findApplicableRules(
        categoryId,
        null,
        amount
      );

    // Sort by approval order (ascending) to ensure proper sequence
    return applicableRules.sort((a, b) => {
      if (a.approvalOrder.isLessThan(b.approvalOrder)) return -1;
      if (a.approvalOrder.isGreaterThan(b.approvalOrder)) return 1;
      return 0;
    });
  }

  async getOrderedRulesForCategory(
    categoryId: CategoryId
  ): Promise<ApprovalRule[]> {
    const rules = await this.approvalRuleQueryRepo.findByCategory(categoryId);

    // Sort by approval order (ascending)
    return rules.sort((a, b) => {
      if (a.approvalOrder.isLessThan(b.approvalOrder)) return -1;
      if (a.approvalOrder.isGreaterThan(b.approvalOrder)) return 1;
      return 0;
    });
  }

  async validateRuleChain(categoryId: CategoryId): Promise<void> {
    const rules = await this.getOrderedRulesForCategory(categoryId);

    if (rules.length === 0) {
      return; // No rules to validate
    }

    // Ensure first rule starts at order 1
    const firstRule = rules[0];
    if (!firstRule) {
      return;
    }

    if (!firstRule.isFirstInChain()) {
      throw new Error(
        "Approval rule chain must start with approval order 1"
      );
    }

    // Check for gaps in the sequence
    for (let i = 1; i < rules.length; i++) {
      const prevRule = rules[i - 1];
      const currentRule = rules[i];

      if (!prevRule || !currentRule) {
        continue;
      }

      const expectedOrder = prevRule.approvalOrder.getValue() + 1;
      const actualOrder = currentRule.approvalOrder.getValue();

      if (actualOrder !== expectedOrder) {
        throw new Error(
          `Approval rule chain has a gap: expected order ${expectedOrder}, found ${actualOrder}`
        );
      }
    }
  }

  async ensureAtLeastOneActiveRule(categoryId: CategoryId): Promise<void> {
    const rules = await this.approvalRuleQueryRepo.findByCategory(categoryId);
    const activeRules = rules.filter((rule) => rule.isActive);

    if (activeRules.length === 0) {
      throw new Error("Category must have at least one active approval rule");
    }
  }

  async getNextAvailableOrder(categoryId: CategoryId): Promise<number> {
    const rules = await this.getOrderedRulesForCategory(categoryId);

    if (rules.length === 0) {
      return 1;
    }

    // Return the next sequential order
    const lastRule = rules[rules.length - 1];
    if (!lastRule) {
      return 1;
    }

    const lastOrder = lastRule.approvalOrder.getValue();
    return lastOrder + 1;
  }

  async canDeleteRule(
    _approvalRuleId: ApprovalRuleId,
    _categoryId: CategoryId | null
  ): Promise<{ canDelete: boolean; reason?: string }> {
    // Admin-only controller already enforces permissions.
    // Allow deleting any rule (including last/middle) to give admins full control.
    return { canDelete: true };
  }

  private isLastInChain(rule: ApprovalRule, allRules: ApprovalRule[]): boolean {
    const maxOrder = Math.max(
      ...allRules.map((r) => r.approvalOrder.getValue())
    );
    return rule.approvalOrder.getValue() === maxOrder;
  }
}
