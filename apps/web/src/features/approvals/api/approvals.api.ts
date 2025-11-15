import { apiClient } from "@/lib/api/client";
import {
  Approval,
  ApprovalDashboardData,
  ApproveApprovalRequest,
  ApproveApprovalResponse,
  RejectApprovalRequest,
  RejectApprovalResponse,
  UpdateApprovalRequest,
  GetAllApprovalsParams,
  RejectedApprovalData,
  GetRejectedApprovalsParams,
} from "../types";

export const approvalsApi = {
  getAll: async (params?: GetAllApprovalsParams): Promise<Approval[]> => {
    const response = await apiClient.get<{ success: boolean; data: Approval[] }>(
      "/approvals",
      { params }
    );
    return response.data.data;
  },

  getPending: async (approverId?: string): Promise<Approval[]> => {
    const response = await apiClient.get<{ success: boolean; data: Approval[] }>(
      "/approvals/pending",
      { params: approverId ? { approverId } : undefined }
    );
    return response.data.data;
  },

  getById: async (approvalId: string): Promise<Approval> => {
    const response = await apiClient.get<{ success: boolean; data: Approval }>(
      `/approvals/${approvalId}`
    );
    return response.data.data;
  },

  getByExpense: async (expenseId: string): Promise<Approval[]> => {
    const response = await apiClient.get<{ success: boolean; data: Approval[] }>(
      `/approvals/expense/${expenseId}`
    );
    return response.data.data;
  },

  getByApprover: async (approverId: string): Promise<Approval[]> => {
    const response = await apiClient.get<{ success: boolean; data: Approval[] }>(
      `/approvals/approver/${approverId}`
    );
    return response.data.data;
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
    const response = await apiClient.patch<{ success: boolean; data: Approval }>(
      `/approvals/${approvalId}`,
      data
    );
    return response.data.data;
  },
};
