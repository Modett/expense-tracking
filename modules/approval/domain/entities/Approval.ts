import {
  ApprovalId,
  ApprovalStatus,
  ApprovalComments,
  ExpenseId,
  UserId,
} from "../value-objects/index.js";

export interface ApprovalProps {
  id: ApprovalId;
  expenseId: ExpenseId;
  approverId: UserId;
  status: ApprovalStatus;
  comments?: ApprovalComments | undefined;
  approvedAt?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateApprovalProps {
  expenseId: ExpenseId;
  approverId: UserId;
  comments?: ApprovalComments;
}

export class Approval {
  private constructor(private props: ApprovalProps) {
    this.validate();
  }

  static create(props: CreateApprovalProps): Approval {
    const now = new Date();

    return new Approval({
      id: ApprovalId.create(),
      expenseId: props.expenseId,
      approverId: props.approverId,
      status: ApprovalStatus.pending(),
      comments: props.comments,
      approvedAt: undefined,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: ApprovalProps): Approval {
    return new Approval(props);
  }

  private validate(): void {
    if (!this.props.id) {
      throw new Error("Approval ID is required");
    }
    if (!this.props.expenseId) {
      throw new Error("Expense ID is required");
    }
    if (!this.props.approverId) {
      throw new Error("Approver ID is required");
    }
    if (!this.props.status) {
      throw new Error("Approval status is required");
    }
  }

  get id(): ApprovalId {
    return this.props.id;
  }

  get expenseId(): ExpenseId {
    return this.props.expenseId;
  }

  get approverId(): UserId {
    return this.props.approverId;
  }

  get status(): ApprovalStatus {
    return this.props.status;
  }

  get comments(): ApprovalComments | undefined {
    return this.props.comments;
  }

  get approvedAt(): Date | undefined {
    return this.props.approvedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateComments(comments: ApprovalComments): void {
    if (!this.status.canBeModified()) {
      throw new Error(
        `Cannot update comments: approval is ${this.status.toString()}`
      );
    }
    this.props.comments = comments;
    this.props.updatedAt = new Date();
  }

  approve(comments?: ApprovalComments): void {
    if (!this.status.isPending()) {
      throw new Error(
        `Cannot approve: approval status is ${this.status.toString()}`
      );
    }

    this.props.status = ApprovalStatus.approved();
    this.props.approvedAt = new Date();
    if (comments) {
      this.props.comments = comments;
    }
    this.props.updatedAt = new Date();
  }

  reject(comments?: ApprovalComments): void {
    if (!this.status.isPending()) {
      throw new Error(
        `Cannot reject: approval status is ${this.status.toString()}`
      );
    }

    this.props.status = ApprovalStatus.rejected();
    this.props.approvedAt = new Date();
    if (comments) {
      this.props.comments = comments;
    }
    this.props.updatedAt = new Date();
  }

  skip(comments?: ApprovalComments): void {
    if (!this.status.isPending()) {
      throw new Error(
        `Cannot skip: approval status is ${this.status.toString()}`
      );
    }

    this.props.status = ApprovalStatus.skipped();
    if (comments) {
      this.props.comments = comments;
    }
    this.props.updatedAt = new Date();
  }

  isApprovedBy(userId: UserId): boolean {
    return this.props.approverId.equals(userId);
  }

  isForExpense(expenseId: ExpenseId): boolean {
    return this.props.expenseId.equals(expenseId);
  }

  isPending(): boolean {
    return this.props.status.isPending();
  }

  isApproved(): boolean {
    return this.props.status.isApproved();
  }

  isRejected(): boolean {
    return this.props.status.isRejected();
  }

  isSkipped(): boolean {
    return this.props.status.isSkipped();
  }

  hasComments(): boolean {
    return this.props.comments !== undefined && this.props.comments.hasValue();
  }

  equals(other: Approval): boolean {
    if (!other) return false;
    return this.props.id.equals(other.props.id);
  }

  toPlainObject() {
    return {
      id: this.props.id.getValue(),
      expenseId: this.props.expenseId.getValue(),
      approverId: this.props.approverId.getValue(),
      status: this.props.status.getValue(),
      comments: this.props.comments?.getValue() || null,
      approvedAt: this.props.approvedAt || null,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
