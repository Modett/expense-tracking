export enum OrganizationTypeEnum {
  ENTERPRISE = "enterprise",
  STARTUP = "startup",
  PERSONAL = "personal",
}

/**
 * OrganizationType Value Object
 * Defines the type of organization using the expense tracker
 * Used to determine feature visibility and business rules
 *
 * ENTERPRISE: Large organizations (50+ employees)
 *   - Full department structure required
 *   - Complex approval workflows
 *   - Department-based budgets
 *   - Multi-level hierarchies
 *
 * STARTUP: Small to medium businesses (1-50 employees)
 *   - Optional department structure
 *   - Simplified approval workflows
 *   - Flexible budget allocation
 *   - Flat hierarchy
 *
 * PERSONAL: Individual/freelancer tracking
 *   - No department structure
 *   - No approval workflows (auto-approve or self-approve)
 *   - Category-based or personal budgets
 *   - Single-user focus
 */
export class OrganizationType {
  private constructor(private readonly value: OrganizationTypeEnum) {
    if (!value) {
      throw new Error("OrganizationType cannot be empty");
    }

    if (!Object.values(OrganizationTypeEnum).includes(value)) {
      throw new Error(
        `Invalid OrganizationType: ${value}. Must be one of: ${Object.values(
          OrganizationTypeEnum
        ).join(", ")}`
      );
    }
  }

  static create(type: OrganizationTypeEnum): OrganizationType {
    return new OrganizationType(type);
  }

  static enterprise(): OrganizationType {
    return new OrganizationType(OrganizationTypeEnum.ENTERPRISE);
  }

  static startup(): OrganizationType {
    return new OrganizationType(OrganizationTypeEnum.STARTUP);
  }

  static personal(): OrganizationType {
    return new OrganizationType(OrganizationTypeEnum.PERSONAL);
  }

  static fromString(value: string): OrganizationType {
    const lowerValue = value.toLowerCase() as OrganizationTypeEnum;
    return new OrganizationType(lowerValue);
  }

  getValue(): OrganizationTypeEnum {
    return this.value;
  }

  equals(other: OrganizationType): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  isEnterprise(): boolean {
    return this.value === OrganizationTypeEnum.ENTERPRISE;
  }

  isStartup(): boolean {
    return this.value === OrganizationTypeEnum.STARTUP;
  }

  isPersonal(): boolean {
    return this.value === OrganizationTypeEnum.PERSONAL;
  }

  /**
   * Check if departments are required for this organization type
   */
  requiresDepartments(): boolean {
    return this.value === OrganizationTypeEnum.ENTERPRISE;
  }

  /**
   * Check if departments are optional (can use default "General" department)
   */
  allowsOptionalDepartments(): boolean {
    return (
      this.value === OrganizationTypeEnum.STARTUP ||
      this.value === OrganizationTypeEnum.PERSONAL
    );
  }

  /**
   * Check if approval workflows are required
   */
  requiresApprovalWorkflow(): boolean {
    return (
      this.value === OrganizationTypeEnum.ENTERPRISE ||
      this.value === OrganizationTypeEnum.STARTUP
    );
  }

  /**
   * Check if multi-level approval chains are needed
   */
  requiresMultiLevelApproval(): boolean {
    return this.value === OrganizationTypeEnum.ENTERPRISE;
  }

  /**
   * Check if department should be hidden in UI
   */
  shouldHideDepartmentUI(): boolean {
    return this.value === OrganizationTypeEnum.PERSONAL;
  }

  /**
   * Get default approval chain complexity
   * Returns number of approval levels: 1-3
   */
  getDefaultApprovalLevels(): number {
    switch (this.value) {
      case OrganizationTypeEnum.ENTERPRISE:
        return 3; // Manager → Finance → Admin/CFO
      case OrganizationTypeEnum.STARTUP:
        return 1; // Single approver (founder/manager)
      case OrganizationTypeEnum.PERSONAL:
        return 0; // No approval needed
      default:
        return 1;
    }
  }

  /**
   * Get recommended budget structure
   */
  getRecommendedBudgetStructure(): string {
    switch (this.value) {
      case OrganizationTypeEnum.ENTERPRISE:
        return "department-category"; // Budgets per department per category
      case OrganizationTypeEnum.STARTUP:
        return "category"; // Budgets per category only
      case OrganizationTypeEnum.PERSONAL:
        return "monthly"; // Simple monthly budget
      default:
        return "category";
    }
  }

  /**
   * Get display name for UI
   */
  getDisplayName(): string {
    switch (this.value) {
      case OrganizationTypeEnum.ENTERPRISE:
        return "Enterprise Organization";
      case OrganizationTypeEnum.STARTUP:
        return "Startup/Small Business";
      case OrganizationTypeEnum.PERSONAL:
        return "Personal/Freelancer";
      default:
        return this.value;
    }
  }

  /**
   * Get description for UI
   */
  getDescription(): string {
    switch (this.value) {
      case OrganizationTypeEnum.ENTERPRISE:
        return "Large organization with formal department structure and complex approval workflows";
      case OrganizationTypeEnum.STARTUP:
        return "Small to medium business with flexible structure and simplified workflows";
      case OrganizationTypeEnum.PERSONAL:
        return "Individual expense tracking for freelancers and personal finance";
      default:
        return "";
    }
  }
}
