import { apiClient } from "@/lib/api/client";
import {
  ApprovalRule,
  ApproverRoleEnum,
  CreateApprovalRuleRequest,
  UpdateApprovalRuleRequest,
  GetAllApprovalRulesParams,
  CreateApprovalRuleResponse,
} from "../types";

const normalizeRole = (role: string | undefined): ApproverRoleEnum => {
  if (!role) return ApproverRoleEnum.MANAGER;
  const key = role.toUpperCase() as keyof typeof ApproverRoleEnum;
  return ApproverRoleEnum[key] ?? ApproverRoleEnum.MANAGER;
};

const mapRule = (rule: ApprovalRule): ApprovalRule => ({
  ...rule,
  approverRole: normalizeRole(rule.approverRole as unknown as string),
});

const extractRules = (payload: any): ApprovalRule[] => {
  console.log("extractRules payload structure:", {
    type: typeof payload,
    isArray: Array.isArray(payload),
    hasData: "data" in (payload || {}),
    dataType: typeof payload?.data,
    dataIsArray: Array.isArray(payload?.data),
    success: payload?.success,
    dataLength: payload?.data?.length,
    fullPayload: payload,
  });

  if (!payload) {
    console.log("Payload is null/undefined");
    return [];
  }

  // Direct array
  if (Array.isArray(payload)) {
    console.log("Payload is direct array, length:", payload.length);
    return payload.map(mapRule);
  }

  // Check if payload has success and data properties (backend format: { success: true, data: [...] })
  if (payload.success && payload.data) {
    if (Array.isArray(payload.data)) {
      console.log(
        "Found data array at payload.data, length:",
        payload.data.length
      );
      return payload.data.map(mapRule);
    }
    console.log("payload.data exists but is not array:", typeof payload.data);
    console.log("payload.data keys:", Object.keys(payload.data));
    console.log("payload.data content:", payload.data);

    // Check if data is nested further (e.g., payload.data.data or payload.data.rules)
    if (payload.data.data && Array.isArray(payload.data.data)) {
      console.log(
        "Found nested array at payload.data.data, length:",
        payload.data.data.length
      );
      return payload.data.data.map(mapRule);
    }

    if (payload.data.rules && Array.isArray(payload.data.rules)) {
      console.log("Found nested array at payload.data.rules");
      return payload.data.rules.map(mapRule);
    }

    // If payload.data is an object, convert Object.values to array
    if (
      typeof payload.data === "object" &&
      payload.data !== null &&
      !Array.isArray(payload.data)
    ) {
      console.log("payload.data is object, converting to array");
      const dataArray = Object.values(payload.data) as ApprovalRule[];
      console.log("Converted to array, length:", dataArray.length);
      if (dataArray.length > 0) {
        return dataArray.map(mapRule);
      }
    }
  }

  // Legacy format checks
  if (Array.isArray(payload.data)) {
    console.log("Found array at payload.data (no success field)");
    return payload.data.map(mapRule);
  }

  if (Array.isArray(payload.approvalRules)) {
    console.log("Found array at payload.approvalRules");
    return payload.approvalRules.map(mapRule);
  }

  console.warn(
    "extractRules: No matching condition, returning empty array. Payload:",
    payload
  );
  return [];
};

const extractRule = (payload: any): ApprovalRule => {
  if (!payload) {
    throw new Error("Approval rule not found");
  }
  const rule = (payload.data ?? payload) as ApprovalRule;
  return mapRule(rule);
};

export const approvalRulesApi = {
  getAll: async (
    params?: GetAllApprovalRulesParams
  ): Promise<ApprovalRule[]> => {
    const response = await apiClient.get("/approval-rules", { params });
    return extractRules(response.data);
  },

  getById: async (ruleId: string): Promise<ApprovalRule> => {
    const response = await apiClient.get(`/approval-rules/${ruleId}`);
    return extractRule(response.data);
  },

  getByCategory: async (categoryId: string): Promise<ApprovalRule[]> => {
    const response = await apiClient.get(
      `/approval-rules/category/${categoryId}`
    );
    return extractRules(response.data);
  },

  getApplicable: async (
    categoryId: string,
    amount: number
  ): Promise<ApprovalRule[]> => {
    const response = await apiClient.get("/approval-rules/applicable", {
      params: { categoryId, amount },
    });
    return extractRules(response.data);
  },

  create: async (
    data: CreateApprovalRuleRequest
  ): Promise<CreateApprovalRuleResponse> => {
    const payload = {
      ...data,
      approverRole: data.approverRole.toLowerCase(),
    };
    const response = await apiClient.post<{
      success: boolean;
      data: CreateApprovalRuleResponse;
    }>("/approval-rules", payload);
    return response.data.data;
  },

  update: async (
    ruleId: string,
    data: UpdateApprovalRuleRequest
  ): Promise<ApprovalRule> => {
    const payload = {
      ...data,
      ...(data.approverRole && {
        approverRole: data.approverRole.toLowerCase(),
      }),
    };
    const response = await apiClient.patch(
      `/approval-rules/${ruleId}`,
      payload
    );
    return extractRule(response.data);
  },

  delete: async (ruleId: string): Promise<void> => {
    await apiClient.delete(`/approval-rules/${ruleId}`);
  },

  activate: async (ruleId: string): Promise<ApprovalRule> => {
    const response = await apiClient.post(`/approval-rules/${ruleId}/activate`);
    return extractRule(response.data);
  },

  deactivate: async (ruleId: string): Promise<ApprovalRule> => {
    const response = await apiClient.post(
      `/approval-rules/${ruleId}/deactivate`
    );
    return extractRule(response.data);
  },
};
