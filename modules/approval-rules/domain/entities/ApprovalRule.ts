import {
  ApprovalRuleId,
  MinAmount,
  ApproverRole,
  ApprovalOrder,
  CategoryId,
} from "../value-objects/index.js";
import { DepartmentId } from "../../../master-data/domain/value-objects/index.js";

export interface ApprovalRuleProps {
  id: ApprovalRuleId;
  categoryId: CategoryId | null;
  departmentId: DepartmentId | null;
  minAmount: MinAmount;
  approverRole: ApproverRole;
  approvalOrder: ApprovalOrder;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateApprovalRuleProps {
  categoryId?: CategoryId | null;
  departmentId?: DepartmentId | null;
  minAmount: MinAmount;
  approverRole: ApproverRole;
  approvalOrder: ApprovalOrder;
}

export class ApprovalRule {
  private constructor(private props: ApprovalRuleProps) {
    this.validate();
  }

  static create(props: CreateApprovalRuleProps): ApprovalRule {
    const now = new Date();

    return new ApprovalRule({
      id: ApprovalRuleId.create(),
      categoryId: props.categoryId || null,
      departmentId: props.departmentId || null,
      minAmount: props.minAmount,
      approverRole: props.approverRole,
      approvalOrder: props.approvalOrder,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: ApprovalRuleProps): ApprovalRule {
    return new ApprovalRule(props);
  }

  private validate(): void {
    if (!this.props.id) {
      throw new Error("ApprovalRule ID is required");
    }
    // Allow organization-wide rules that aren't tied to a specific category/department.
    if (!this.props.minAmount) {
      throw new Error("Minimum amount is required");
    }
    if (!this.props.approverRole) {
      throw new Error("Approver role is required");
    }
    if (!this.props.approvalOrder) {
      throw new Error("Approval order is required");
    }
  }

  get id(): ApprovalRuleId {
    return this.props.id;
  }

  get categoryId(): CategoryId | null {
    return this.props.categoryId;
  }

  get departmentId(): DepartmentId | null {
    return this.props.departmentId;
  }

  get minAmount(): MinAmount {
    return this.props.minAmount;
  }

  get approverRole(): ApproverRole {
    return this.props.approverRole;
  }

  get approvalOrder(): ApprovalOrder {
    return this.props.approvalOrder;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business logic methods

  updateMinAmount(minAmount: MinAmount): void {
    if (!this.isActive) {
      throw new Error("Cannot update inactive approval rule");
    }

    this.props.minAmount = minAmount;
    this.props.updatedAt = new Date();
  }

  updateApproverRole(approverRole: ApproverRole): void {
    if (!this.isActive) {
      throw new Error("Cannot update inactive approval rule");
    }

    this.props.approverRole = approverRole;
    this.props.updatedAt = new Date();
  }

  updateCategory(categoryId: CategoryId | null): void {
    if (!this.isActive) {
      throw new Error("Cannot update inactive approval rule");
    }

    this.props.categoryId = categoryId;
    this.props.updatedAt = new Date();
  }

  updateDepartment(departmentId: DepartmentId | null): void {
    if (!this.isActive) {
      throw new Error("Cannot update inactive approval rule");
    }

    this.props.departmentId = departmentId;
    this.props.updatedAt = new Date();
  }

  updateApprovalOrder(approvalOrder: ApprovalOrder): void {
    if (!this.isActive) {
      throw new Error("Cannot update inactive approval rule");
    }

    this.props.approvalOrder = approvalOrder;
    this.props.updatedAt = new Date();
  }

  activate(): void {
    // Idempotent: safe to call even if already active
    if (this.isActive) {
      return; // Already active, nothing to do
    }

    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    // Idempotent: safe to call even if already inactive
    if (!this.isActive) {
      return; // Already inactive, nothing to do
    }

    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  // Query methods

  appliesTo(categoryId: CategoryId | null, departmentId: DepartmentId | null, amount: number): boolean {
    if (!this.isActive) {
      return false;
    }

    const categoryMatches = this.props.categoryId
      ? (categoryId ? this.props.categoryId.equals(categoryId) : false)
      : true;

    const departmentMatches = this.props.departmentId
      ? (departmentId ? this.props.departmentId.equals(departmentId) : false)
      : true;

    return categoryMatches && departmentMatches && this.props.minAmount.matches(amount);
  }

  appliesToCategory(categoryId: CategoryId): boolean {
    if (!this.props.categoryId) return false;
    return this.props.categoryId.equals(categoryId);
  }

  appliesToDepartment(departmentId: DepartmentId): boolean {
    if (!this.props.departmentId) return false;
    return this.props.departmentId.equals(departmentId);
  }

  appliesToAmount(amount: number): boolean {
    return this.props.minAmount.matches(amount);
  }

  isForCategory(categoryId: CategoryId): boolean {
    if (!this.props.categoryId) return false;
    return this.props.categoryId.equals(categoryId);
  }

  isForDepartment(departmentId: DepartmentId): boolean {
    if (!this.props.departmentId) return false;
    return this.props.departmentId.equals(departmentId);
  }

  isCategoryBased(): boolean {
    return this.props.categoryId !== null;
  }

  isDepartmentBased(): boolean {
    return this.props.departmentId !== null;
  }

  isFirstInChain(): boolean {
    return this.props.approvalOrder.isFirst();
  }

  hasHigherPriorityThan(other: ApprovalRule): boolean {
    return this.props.approvalOrder.isLessThan(other.approvalOrder);
  }

  hasLowerPriorityThan(other: ApprovalRule): boolean {
    return this.props.approvalOrder.isGreaterThan(other.approvalOrder);
  }

  equals(other: ApprovalRule): boolean {
    if (!other) return false;
    return this.props.id.equals(other.props.id);
  }

  toPlainObject() {
    return {
      ruleId: this.props.id.getValue(),
      categoryId: this.props.categoryId?.getValue() || null,
      departmentId: this.props.departmentId?.getValue() || null,
      minAmount: this.props.minAmount.getValue(),
      approverRole: this.props.approverRole.getValue(),
      approvalOrder: this.props.approvalOrder.getValue(),
      isActive: this.props.isActive,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
