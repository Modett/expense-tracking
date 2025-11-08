import type { PrismaClient, Approval as PrismaApproval } from "@prisma/client";
import type {
  IApprovalQueryRepository,
  ApprovalFilters,
} from "../../domain/repositories/IApprovalQueryRepository.js";
import { Approval } from "../../domain/entities/Approval.js";
import {
  ApprovalId,
  ApprovalStatus,
  ApprovalComments,
  ExpenseId,
  UserId,
} from "../../domain/value-objects/index.js";

export class PrismaApprovalQueryRepository implements IApprovalQueryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(prismaApproval: PrismaApproval): Approval {
    return Approval.reconstitute({
      id: ApprovalId.fromString(prismaApproval.approvalId),
      expenseId: ExpenseId.fromString(prismaApproval.expenseId),
      approverId: UserId.fromString(prismaApproval.approverId),
      status: ApprovalStatus.fromString(prismaApproval.status),
      comments: prismaApproval.comments
        ? ApprovalComments.fromString(prismaApproval.comments)
        : undefined,
      approvedAt: prismaApproval.approvedAt || undefined,
      createdAt: prismaApproval.createdAt,
      updatedAt: prismaApproval.updatedAt,
    });
  }

  async findById(approvalId: ApprovalId): Promise<Approval | null> {
    const approval = await this.prisma.approval.findUnique({
      where: { approvalId: approvalId.getValue() },
    });

    if (!approval) {
      return null;
    }

    return this.toDomain(approval);
  }

  async findByExpenseId(expenseId: ExpenseId): Promise<Approval[]> {
    const approvals = await this.prisma.approval.findMany({
      where: { expenseId: expenseId.getValue() },
      orderBy: { createdAt: "desc" },
    });

    return approvals.map((approval) => this.toDomain(approval));
  }

  async findByApproverId(approverId: UserId): Promise<Approval[]> {
    const approvals = await this.prisma.approval.findMany({
      where: { approverId: approverId.getValue() },
      orderBy: { createdAt: "desc" },
    });

    return approvals.map((approval) => this.toDomain(approval));
  }

  async findByStatus(status: ApprovalStatus): Promise<Approval[]> {
    const approvals = await this.prisma.approval.findMany({
      where: { status: status.getValue() },
      orderBy: { createdAt: "desc" },
    });

    return approvals.map((approval) => this.toDomain(approval));
  }

  async findPendingApprovals(): Promise<Approval[]> {
    const approvals = await this.prisma.approval.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" },
    });

    return approvals.map((approval) => this.toDomain(approval));
  }

  async findPendingApprovalsByApproverId(
    approverId: UserId
  ): Promise<Approval[]> {
    const approvals = await this.prisma.approval.findMany({
      where: {
        approverId: approverId.getValue(),
        status: "pending",
      },
      orderBy: { createdAt: "asc" },
    });

    return approvals.map((approval) => this.toDomain(approval));
  }

  async findAll(filters?: ApprovalFilters): Promise<Approval[]> {
    const where: any = {};

    if (filters?.expenseId) {
      where.expenseId = filters.expenseId.getValue();
    }

    if (filters?.approverId) {
      where.approverId = filters.approverId.getValue();
    }

    if (filters?.status) {
      where.status = filters.status.getValue();
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
      }
    }

    const approvals = await this.prisma.approval.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return approvals.map((approval) => this.toDomain(approval));
  }

  async count(filters?: ApprovalFilters): Promise<number> {
    const where: any = {};

    if (filters?.expenseId) {
      where.expenseId = filters.expenseId.getValue();
    }

    if (filters?.approverId) {
      where.approverId = filters.approverId.getValue();
    }

    if (filters?.status) {
      where.status = filters.status.getValue();
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
      }
    }

    return await this.prisma.approval.count({ where });
  }
}
