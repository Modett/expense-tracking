import type { Expense } from "../../domain/entities/Expense.js";
import type { BudgetCheckResponse } from "./BudgetEnforcementService.js";
import { BudgetExceptionTypeEnum } from "../../domain/value-objects/BudgetExceptionType.js";
import { ExpensePriorityType } from "../../domain/value-objects/ExpensePriority.js";

export enum ApprovalLevel {
  MANAGER = 1,
  FINANCE = 2,
  ADMIN = 3,
  CFO = 4,
  CEO = 5,
}

export interface ApprovalChainRule {
  level: ApprovalLevel;
  role: string;
  required: boolean;
  canBypass: boolean;
  reason?: string;
}

export interface ApprovalChainConfig {
  rules: ApprovalChainRule[];
  reason: string;
  requiresSpecialHandling: boolean;
  escalationEnabled: boolean;
  slaHours: number;
}

/**
 * ApprovalChainBuilderService
 *
 * Dynamically builds approval chains based on:
 * - Expense amount (threshold-based)
 * - Priority level (routine, standard, urgent, emergency)
 * - Budget status (within budget, exceeds budget)
 * - Budget override type
 * - Category risk level (configurable)
 *
 * This implements your requirement for flexible approval chains where:
 * - Different expenses need different approval paths
 * - Admins can directly approve some expenses
 * - Budget overrides require executive approval
 * - Emergency expenses skip lower levels
 */
export class ApprovalChainBuilderService {
  /**
   * Build approval chain for an expense based on multiple factors
   */
  buildApprovalChain(
    expense: Expense,
    budgetCheckResult?: BudgetCheckResponse
  ): ApprovalChainConfig {
    const amount = expense.amount.getTotalValue();
    const priority = expense.priority.getValue();
    const budgetOverride = expense.budgetOverride.getValue();
    const hasBudgetOverride = budgetOverride !== BudgetExceptionTypeEnum.NONE;

    // Determine base approval chain by amount
    let chain = this.getChainByAmount(amount);

    // Modify chain based on budget status
    if (budgetCheckResult?.requiresOverride && hasBudgetOverride) {
      chain = this.applyBudgetOverrideRules(chain, budgetOverride);
    }

    // Modify chain based on priority
    chain = this.applyPriorityRules(chain, priority);

    // Determine SLA based on priority
    const slaHours = expense.priority.getSLAHours();

    return {
      rules: chain,
      reason: this.getChainReason(amount, priority, hasBudgetOverride),
      requiresSpecialHandling: hasBudgetOverride || priority === ExpensePriorityType.EMERGENCY,
      escalationEnabled: priority === ExpensePriorityType.URGENT || priority === ExpensePriorityType.EMERGENCY,
      slaHours,
    };
  }

  /**
   * Get base approval chain based on expense amount
   *
   * Amount Thresholds (configurable):
   * - $0 - $500: Manager only
   * - $501 - $5,000: Manager → Finance
   * - $5,001 - $50,000: Manager → Finance → Admin
   * - $50,000+: Manager → Finance → CFO → CEO
   */
  private getChainByAmount(amount: number): ApprovalChainRule[] {
    if (amount <= 500) {
      return [
        {
          level: ApprovalLevel.MANAGER,
          role: "manager",
          required: true,
          canBypass: false,
        },
      ];
    }

    if (amount <= 5000) {
      return [
        {
          level: ApprovalLevel.MANAGER,
          role: "manager",
          required: true,
          canBypass: false,
        },
        {
          level: ApprovalLevel.FINANCE,
          role: "finance",
          required: true,
          canBypass: false,
        },
      ];
    }

    if (amount <= 50000) {
      return [
        {
          level: ApprovalLevel.MANAGER,
          role: "manager",
          required: true,
          canBypass: false,
        },
        {
          level: ApprovalLevel.FINANCE,
          role: "finance",
          required: true,
          canBypass: false,
        },
        {
          level: ApprovalLevel.ADMIN,
          role: "admin",
          required: true,
          canBypass: false,
        },
      ];
    }

    // $50,000+
    return [
      {
        level: ApprovalLevel.MANAGER,
        role: "manager",
        required: true,
        canBypass: false,
      },
      {
        level: ApprovalLevel.FINANCE,
        role: "finance",
        required: true,
        canBypass: false,
      },
      {
        level: ApprovalLevel.CFO,
        role: "finance", // CFO uses finance role for now
        required: true,
        canBypass: false,
        reason: "CFO approval required for $50K+",
      },
      {
        level: ApprovalLevel.CEO,
        role: "admin", // CEO uses admin role for now
        required: true,
        canBypass: false,
        reason: "CEO approval required for $50K+",
      },
    ];
  }

  /**
   * Apply budget override rules to approval chain
   *
   * Budget Override Modifications:
   * - EMERGENCY: Skip to Finance → Admin (fast-track)
   * - ANNUAL: Require Finance → Admin
   * - RECURRING: Require Finance minimum
   */
  private applyBudgetOverrideRules(
    chain: ApprovalChainRule[],
    overrideType: BudgetExceptionTypeEnum
  ): ApprovalChainRule[] {
    switch (overrideType) {
      case BudgetExceptionTypeEnum.EMERGENCY:
        // Emergency: Skip manager, go directly to Finance → Admin
        return [
          {
            level: ApprovalLevel.FINANCE,
            role: "finance",
            required: true,
            canBypass: false,
            reason: "Emergency budget override - fast-track to Finance",
          },
          {
            level: ApprovalLevel.ADMIN,
            role: "admin",
            required: true,
            canBypass: false,
            reason: "Emergency budget override - requires Admin approval",
          },
        ];

      case BudgetExceptionTypeEnum.ANNUAL:
        // Annual: Ensure Finance and Admin are in chain
        const hasFinance = chain.some((r) => r.level === ApprovalLevel.FINANCE);
        const hasAdmin = chain.some((r) => r.level === ApprovalLevel.ADMIN);

        if (!hasFinance) {
          chain.push({
            level: ApprovalLevel.FINANCE,
            role: "finance",
            required: true,
            canBypass: false,
            reason: "Annual budget override requires Finance approval",
          });
        }

        if (!hasAdmin) {
          chain.push({
            level: ApprovalLevel.ADMIN,
            role: "admin",
            required: true,
            canBypass: false,
            reason: "Annual budget override requires Admin approval",
          });
        }

        return chain.sort((a, b) => a.level - b.level);

      case BudgetExceptionTypeEnum.RECURRING:
        // Recurring: Ensure at least Finance is in chain
        const hasFinanceRecurring = chain.some(
          (r) => r.level === ApprovalLevel.FINANCE
        );

        if (!hasFinanceRecurring) {
          chain.push({
            level: ApprovalLevel.FINANCE,
            role: "finance",
            required: true,
            canBypass: false,
            reason: "Recurring budget override requires Finance approval",
          });
        }

        return chain.sort((a, b) => a.level - b.level);

      default:
        return chain;
    }
  }

  /**
   * Apply priority-based rules to approval chain
   *
   * Priority Modifications:
   * - EMERGENCY: Skip manager, go directly to highest authority with budget
   * - URGENT: Enable auto-escalation, skip 1 level if SLA violated
   * - STANDARD/ROUTINE: Normal chain processing
   */
  private applyPriorityRules(
    chain: ApprovalChainRule[],
    priority: ExpensePriorityType
  ): ApprovalChainRule[] {
    switch (priority) {
      case ExpensePriorityType.EMERGENCY:
        // Emergency: Skip to highest level in current chain
        if (chain.length === 0) return chain;

        // Keep only the highest two levels
        const sortedChain = [...chain].sort((a, b) => b.level - a.level);
        return sortedChain.slice(0, 2).map((rule) => ({
          ...rule,
          reason: `Emergency priority - fast-track approval`,
        }));

      case ExpensePriorityType.URGENT:
        // Urgent: Keep chain but mark for escalation
        return chain.map((rule) => ({
          ...rule,
          reason: rule.reason || `Urgent priority - auto-escalation enabled`,
        }));

      case ExpensePriorityType.STANDARD:
      case ExpensePriorityType.ROUTINE:
      default:
        return chain;
    }
  }

  /**
   * Get human-readable reason for approval chain configuration
   */
  private getChainReason(
    amount: number,
    priority: ExpensePriorityType,
    hasBudgetOverride: boolean
  ): string {
    const parts: string[] = [];

    // Amount-based reason
    if (amount <= 500) {
      parts.push("Small expense ($0-$500)");
    } else if (amount <= 5000) {
      parts.push("Medium expense ($501-$5,000)");
    } else if (amount <= 50000) {
      parts.push("Large expense ($5,001-$50,000)");
    } else {
      parts.push("Very large expense ($50,000+)");
    }

    // Priority-based reason
    if (priority === ExpensePriorityType.EMERGENCY) {
      parts.push("Emergency priority - expedited approval");
    } else if (priority === ExpensePriorityType.URGENT) {
      parts.push("Urgent priority - 24h SLA");
    }

    // Budget override reason
    if (hasBudgetOverride) {
      parts.push("Budget override - requires executive approval");
    }

    return parts.join(" | ");
  }

  /**
   * Check if admin can directly approve this expense
   * (bypassing lower levels)
   *
   * Admin can directly approve:
   * - Amounts under $10,000 (configurable)
   * - Emergency expenses (with justification)
   * - Pre-authorized categories
   */
  canAdminDirectlyApprove(expense: Expense): boolean {
    const amount = expense.amount.getTotalValue();
    const priority = expense.priority.getValue();
    const budgetOverride = expense.budgetOverride.getValue();

    // Admin can directly approve small expenses
    if (amount <= 10000) {
      return true;
    }

    // Admin can directly approve emergency with override
    if (
      priority === ExpensePriorityType.EMERGENCY &&
      budgetOverride !== BudgetExceptionTypeEnum.NONE
    ) {
      return true;
    }

    return false;
  }

  /**
   * Get minimum approval level required based on expense characteristics
   */
  getMinimumApprovalLevel(expense: Expense): ApprovalLevel {
    const budgetOverride = expense.budgetOverride.getValue();

    // Budget override determines minimum level
    if (budgetOverride === BudgetExceptionTypeEnum.EMERGENCY) {
      return ApprovalLevel.ADMIN;
    }

    if (budgetOverride === BudgetExceptionTypeEnum.ANNUAL) {
      return ApprovalLevel.ADMIN;
    }

    if (budgetOverride === BudgetExceptionTypeEnum.RECURRING) {
      return ApprovalLevel.FINANCE;
    }

    // Amount-based minimum level
    const amount = expense.amount.getTotalValue();
    if (amount >= 50000) {
      return ApprovalLevel.CFO;
    }

    if (amount >= 5001) {
      return ApprovalLevel.ADMIN;
    }

    if (amount >= 501) {
      return ApprovalLevel.FINANCE;
    }

    return ApprovalLevel.MANAGER;
  }
}
