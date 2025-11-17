import type { PrismaClient, Approval as PrismaApproval } from "@prisma/client";
import type {
  IApprovalQueryRepository,
  ApprovalFilters,
  RejectedApprovalFilters,
} from "../../domain/repositories/IApprovalQueryRepository.js";
import { Approval } from "../../domain/entities/Approval.js";
import {
  ApprovalId,
  ApprovalStatus,
  ApprovalComments,
  ApprovalOrder,
  ExpenseId,
  UserId,
} from "../../domain/value-objects/index.js";

type PrismaApprovalWithRelations = PrismaApproval & {
  expense?: any;
  approver?: any;
};

export class PrismaApprovalQueryRepository implements IApprovalQueryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private readonly relationInclude = {
    expense: {
      include: {
        user: true,
        vendor: true,
        category: true,
        department: true,
      },
    },
    approver: true,
  };

  private toDomain(prismaApproval: PrismaApproval): Approval {
    return Approval.reconstitute({
      id: ApprovalId.fromString(prismaApproval.approvalId),
      expenseId: ExpenseId.fromString(prismaApproval.expenseId),
      approverId: UserId.fromString(prismaApproval.approverId),
      approvalOrder: ApprovalOrder.create(prismaApproval.approvalOrder),
      status: ApprovalStatus.fromString(prismaApproval.status),
      comments: prismaApproval.comments
        ? ApprovalComments.fromString(prismaApproval.comments)
        : undefined,
      approvedAt: prismaApproval.approvedAt || undefined,
      createdAt: prismaApproval.createdAt,
      updatedAt: prismaApproval.updatedAt,
    });
  }

  private mapApprovalRecord(
    prismaApproval: PrismaApprovalWithRelations
  ): Approval {
    const approval = this.toDomain(prismaApproval);
    if (prismaApproval.expense || prismaApproval.approver) {
      approval.attachRelations({
        expense: prismaApproval.expense,
        approver: prismaApproval.approver,
      });
    }
    return approval;
  }

  async findById(approvalId: ApprovalId): Promise<Approval | null> {
    const approval = await this.prisma.approval.findUnique({
      where: { approvalId: approvalId.getValue() },
      include: this.relationInclude,
    });

    if (!approval) {
      return null;
    }

    return this.mapApprovalRecord(approval);
  }

  async findByExpenseId(expenseId: ExpenseId): Promise<Approval[]> {
    const approvals = await this.prisma.approval.findMany({
      where: { expenseId: expenseId.getValue() },
      orderBy: { createdAt: "desc" },
      include: this.relationInclude,
    });

    return approvals.map((approval) => this.mapApprovalRecord(approval));
  }

  async findByApproverId(approverId: UserId): Promise<Approval[]> {
    const approvals = await this.prisma.approval.findMany({
      where: { approverId: approverId.getValue() },
      orderBy: { createdAt: "desc" },
      include: this.relationInclude,
    });

    return approvals.map((approval) => this.mapApprovalRecord(approval));
  }

  async findByStatus(status: ApprovalStatus): Promise<Approval[]> {
    const approvals = await this.prisma.approval.findMany({
      where: { status: status.getValue() as any },
      orderBy: { createdAt: "desc" },
      include: this.relationInclude,
    });

    return approvals.map((approval) => this.mapApprovalRecord(approval));
  }

  async findPendingApprovals(): Promise<Approval[]> {
    const approvals = await this.prisma.approval.findMany({
      where: { status: "pending" },
      include: this.relationInclude,
      orderBy: { createdAt: "asc" },
    });

    return approvals.map((approval: any) =>
      this.mapApprovalRecord(approval as PrismaApprovalWithRelations)
    );
  }

  async findPendingApprovalsByApproverId(
    approverId: UserId
  ): Promise<Approval[]> {
    const approvals = await this.prisma.approval.findMany({
      where: {
        approverId: approverId.getValue(),
        status: "pending",
      },
      include: this.relationInclude,
      orderBy: { createdAt: "asc" },
    });

    return approvals.map((approval: any) =>
      this.mapApprovalRecord(approval as PrismaApprovalWithRelations)
    );
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
      where.status = filters.status.getValue() as any;
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

    return approvals.map((approval: PrismaApproval) => this.toDomain(approval));
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
      where.status = filters.status.getValue() as any;
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

  // Advanced query methods for dashboard and rejection visibility

  async findPendingForUser(userId: string): Promise<any[]> {
    return await this.prisma.approval.findMany({
      where: {
        approverId: userId,
        status: "pending",
      },
      include: {
        expense: true,
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async findApprovedByUserSince(userId: string, since: Date): Promise<any[]> {
    return await this.prisma.approval.findMany({
      where: {
        approverId: userId,
        status: "approved",
        approvedAt: {
          gte: since,
        },
      },
      include: {
        expense: true,
      },
      orderBy: { approvedAt: "desc" },
    });
  }

  async findRejectedByUserSince(userId: string, since: Date): Promise<any[]> {
    return await this.prisma.approval.findMany({
      where: {
        approverId: userId,
        status: "rejected",
        approvedAt: {
          gte: since,
        },
      },
      include: {
        expense: true,
      },
      orderBy: { approvedAt: "desc" },
    });
  }

  async findAwaitingHigherLevel(
    userId: string,
    roleLevel: number
  ): Promise<any[]> {
    // Find expenses where this user approved, but still need more approvals
    const approvedByUser = await this.prisma.approval.findMany({
      where: {
        approverId: userId,
        status: "approved",
      },
      select: {
        expenseId: true,
      },
    });

    const expenseIds = approvedByUser.map((a: any) => a.expenseId);

    if (expenseIds.length === 0) {
      return [];
    }

    // Find approvals for these expenses that are still pending at higher levels
    return await this.prisma.approval.findMany({
      where: {
        expenseId: { in: expenseIds },
        status: "pending",
        approvalOrder: {
          gt: roleLevel,
        },
      },
      include: {
        expense: true,
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async findRejectedBeforeLevel(roleLevel: number): Promise<any[]> {
    return await this.prisma.approval.findMany({
      where: {
        status: "rejected",
        approvalOrder: {
          lt: roleLevel,
        },
      },
      include: {
        expense: true,
      },
      orderBy: { approvedAt: "desc" },
      take: 50,
    });
  }

  async findRejectedApprovals(
    filters: RejectedApprovalFilters
  ): Promise<any[]> {
    const where: any = {
      status: "rejected",
    };

    if (filters.maxApprovalOrder !== undefined) {
      where.approvalOrder = {
        lte: filters.maxApprovalOrder,
      };
    }

    if (filters.rejectedByUserId) {
      where.approverId = filters.rejectedByUserId;
    }

    if (filters.rejectedByRole) {
      where.approver = {
        role: filters.rejectedByRole,
      };
    }

    if (filters.dateFrom || filters.dateTo) {
      where.approvedAt = {};
      if (filters.dateFrom) {
        where.approvedAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.approvedAt.lte = filters.dateTo;
      }
    }

    const expenseWhere: any = {};
    if (filters.departmentId) {
      expenseWhere.departmentId = filters.departmentId;
    }
    if (filters.categoryId) {
      expenseWhere.categoryId = filters.categoryId;
    }

    if (Object.keys(expenseWhere).length > 0) {
      where.expense = expenseWhere;
    }

    return await this.prisma.approval.findMany({
      where,
      include: {
        expense: true,
        approver: true, // Include approver to access role information
      },
      orderBy: { approvedAt: "desc" },
      take: filters.limit || 50,
      skip: filters.offset || 0,
    });
  }
}
