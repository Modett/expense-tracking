import { apiClient } from "@/lib/api/client";
import {
  Approval,
  ApprovalDashboardData,
  ApprovalStatusEnum,
  ApproveApprovalRequest,
  ApproveApprovalResponse,
  RejectApprovalRequest,
  RejectApprovalResponse,
  UpdateApprovalRequest,
  GetAllApprovalsParams,
  RejectedApprovalData,
  GetRejectedApprovalsParams,
} from "../types";

type ApprovalApiResponse = {
  id?: string;
  approvalId?: string;
  expenseId: string;
  approverId: string;
  approverRole?: string;
  approvalOrder: number;
  status?: string;
  comments?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  expense?: Approval["expense"];
  approver?: Approval["approver"];
};

const normalizeDate = (value: string | Date): string =>
  value instanceof Date ? value.toISOString() : new Date(value).toISOString();

const mapStatus = (value?: string): ApprovalStatusEnum => {
  if (!value) return ApprovalStatusEnum.PENDING;
  const key = value.toUpperCase();
  return (
    (ApprovalStatusEnum as Record<string, ApprovalStatusEnum>)[key] ??
    ApprovalStatusEnum.PENDING
  );
};

const mapApproval = (approval: ApprovalApiResponse): Approval => ({
  approvalId: approval.approvalId ?? approval.id ?? "",
  expenseId: approval.expenseId,
  approverId: approval.approverId,
  approverRole: approval.approverRole,
  approvalOrder: approval.approvalOrder,
  status: mapStatus(approval.status),
  comments: approval.comments ?? undefined,
  approvedAt: approval.approvedAt ?? undefined,
  rejectedAt: approval.rejectedAt ?? undefined,
  createdAt: normalizeDate(approval.createdAt),
  updatedAt: normalizeDate(approval.updatedAt),
  expense: approval.expense,
  approver: approval.approver,
});

export const approvalsApi = {
  getAll: async (params?: GetAllApprovalsParams): Promise<Approval[]> => {
    const response = await apiClient.get<{
      success: boolean;
      data: ApprovalApiResponse[];
    }>("/approvals", { params });
    return response.data.data.map(mapApproval);
  },

  getPending: async (approverId?: string): Promise<Approval[]> => {
    const response = await apiClient.get<{
      success: boolean;
      data: ApprovalApiResponse[];
    }>("/approvals/pending", {
      params: approverId ? { approverId } : undefined,
    });
    return response.data.data.map(mapApproval);
  },

  getById: async (approvalId: string): Promise<Approval> => {
    const response = await apiClient.get<{
      success: boolean;
      data: ApprovalApiResponse;
    }>(`/approvals/${approvalId}`);
    return mapApproval(response.data.data);
  },

  getByExpense: async (expenseId: string): Promise<Approval[]> => {
    const response = await apiClient.get<{
      success: boolean;
      data: ApprovalApiResponse[];
    }>(`/approvals/expense/${expenseId}`);
    return response.data.data.map(mapApproval);
  },

  getByApprover: async (approverId: string): Promise<Approval[]> => {
    const response = await apiClient.get<{
      success: boolean;
      data: ApprovalApiResponse[];
    }>(`/approvals/approver/${approverId}`);
    return response.data.data.map(mapApproval);
  },

  getRejectedVisible: async (
    params?: GetRejectedApprovalsParams
  ): Promise<RejectedApprovalData[]> => {
    const response = await apiClient.get<{
      success: boolean;
      data: RejectedApprovalData[];
    }>("/approvals/rejected-visible", { params });
    return response.data.data;
  },

  getDashboard: async (): Promise<ApprovalDashboardData> => {
    const response = await apiClient.get<{
      success: boolean;
      data: ApprovalDashboardData;
    }>("/approvals/dashboard");
    return response.data.data;
  },

  approve: async (
    approvalId: string,
    data?: ApproveApprovalRequest
  ): Promise<ApproveApprovalResponse> => {
    const response = await apiClient.post<{
      success: boolean;
      data: ApproveApprovalResponse;
    }>(`/approvals/${approvalId}/approve`, data);
    return response.data.data;
  },

  reject: async (
    approvalId: string,
    data?: RejectApprovalRequest
  ): Promise<RejectApprovalResponse> => {
    const response = await apiClient.post<{
      success: boolean;
      data: RejectApprovalResponse;
    }>(`/approvals/${approvalId}/reject`, data);
    return response.data.data;
  },

  update: async (
    approvalId: string,
    data: UpdateApprovalRequest
  ): Promise<Approval> => {
    const response = await apiClient.patch<{
      success: boolean;
      data: ApprovalApiResponse;
    }>(`/approvals/${approvalId}`, data);
    return mapApproval(response.data.data);
  },
};
