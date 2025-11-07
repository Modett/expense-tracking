import { ExpenseId, TagId } from "../value-objects/index.js";

export interface ExpenseTagProps {
  expenseId: ExpenseId;
  tagId: TagId;
  createdAt: Date;
}

export interface CreateExpenseTagProps {
  expenseId: ExpenseId;
  tagId: TagId;
}

export class ExpenseTag {
  private constructor(private props: ExpenseTagProps) {
    this.validate();
  }

  static create(props: CreateExpenseTagProps): ExpenseTag {
    return new ExpenseTag({
      expenseId: props.expenseId,
      tagId: props.tagId,
      createdAt: new Date(),
    });
  }

  static reconstitute(props: ExpenseTagProps): ExpenseTag {
    return new ExpenseTag(props);
  }

  private validate(): void {
    if (!this.props.expenseId) {
      throw new Error("Expense ID is required");
    }
    if (!this.props.tagId) {
      throw new Error("Tag ID is required");
    }
    if (!this.props.createdAt) {
      throw new Error("Created at is required");
    }
  }

  get expenseId(): ExpenseId {
    return this.props.expenseId;
  }

  get tagId(): TagId {
    return this.props.tagId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  isForExpense(expenseId: ExpenseId): boolean {
    return this.props.expenseId.equals(expenseId);
  }

  hasTag(tagId: TagId): boolean {
    return this.props.tagId.equals(tagId);
  }

  equals(other: ExpenseTag): boolean {
    if (!other) return false;
    return (
      this.props.expenseId.equals(other.props.expenseId) &&
      this.props.tagId.equals(other.props.tagId)
    );
  }

  getCompositeKey(): string {
    return `${this.props.expenseId.getValue()}_${this.props.tagId.getValue()}`;
  }

  toPlainObject() {
    return {
      expenseId: this.props.expenseId.getValue(),
      tagId: this.props.tagId.getValue(),
      createdAt: this.props.createdAt,
    };
  }
}
