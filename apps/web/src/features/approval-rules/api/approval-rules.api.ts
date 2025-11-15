import { apiClient } from "@/lib/api/client";
import {
  ApprovalRule,
  CreateApprovalRuleRequest,
  UpdateApprovalRuleRequest,
  GetAllApprovalRulesParams,
  CreateApprovalRuleResponse,
} from "../types";

export const approvalRulesApi = {
  getAll: async (params?: GetAllApprovalRulesParams): Promise<ApprovalRule[]> => {
    const response = await apiClient.get<{ success: boolean; data: ApprovalRule[] }>(
      "/approval-rules",
      { params }
    );
    return response.data.data;
  },

  getById: async (ruleId: string): Promise<ApprovalRule> => {
    const response = await apiClient.get<{ success: boolean; data: ApprovalRule }>(
      `/approval-rules/${ruleId}`
    );
    return response.data.data;
  },

  getByCategory: async (categoryId: string): Promise<ApprovalRule[]> => {
    const response = await apiClient.get<{ success: boolean; data: ApprovalRule[] }>(
      `/approval-rules/category/${categoryId}`
    );
    return response.data.data;
  },

  getApplicable: async (categoryId: string, amount: number): Promise<ApprovalRule[]> => {
    const response = await apiClient.get<{ success: boolean; data: ApprovalRule[] }>(
      "/approval-rules/applicable",
      { params: { categoryId, amount } }
    );
    return response.data.data;
  },

  create: async (data: CreateApprovalRuleRequest): Promise<CreateApprovalRuleResponse> => {
    const response = await apiClient.post<{ success: boolean; data: CreateApprovalRuleResponse }>(
      "/approval-rules",
      data
    );
    return response.data.data;
  },

  update: async (ruleId: string, data: UpdateApprovalRuleRequest): Promise<ApprovalRule> => {
    const response = await apiClient.patch<{ success: boolean; data: ApprovalRule }>(
      `/approval-rules/${ruleId}`,
      data
    );
    return response.data.data;
  },

  delete: async (ruleId: string): Promise<void> => {
    await apiClient.delete(`/approval-rules/${ruleId}`);
  },

  activate: async (ruleId: string): Promise<ApprovalRule> => {
    const response = await apiClient.post<{ success: boolean; data: ApprovalRule }>(
      `/approval-rules/${ruleId}/activate`
    );
    return response.data.data;
  },

  deactivate: async (ruleId: string): Promise<ApprovalRule> => {
    const response = await apiClient.post<{ success: boolean; data: ApprovalRule }>(
      `/approval-rules/${ruleId}/deactivate`
    );
    return response.data.data;
  },
};
