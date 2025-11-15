import { apiClient } from "@/lib/api/client";
import { Department } from "@/types/common.types";

export interface CreateDepartmentRequest {
  name: string;
  code?: string;
  description?: string;
}

export interface UpdateDepartmentRequest {
  name: string;
  code?: string;
  description?: string;
}

export const departmentsApi = {
  getAll: async (): Promise<Department[]> => {
    const response = await apiClient.get<{ success: boolean; data: Department[] }>(
      "/departments"
    );
    return response.data.data;
  },

  getById: async (departmentId: string): Promise<Department> => {
    const response = await apiClient.get<{ success: boolean; data: Department }>(
      `/departments/${departmentId}`
    );
    return response.data.data;
  },

  create: async (data: CreateDepartmentRequest): Promise<Department> => {
    const response = await apiClient.post<{ success: boolean; data: Department }>(
      "/departments",
      data
    );
    return response.data.data;
  },

  update: async (departmentId: string, data: UpdateDepartmentRequest): Promise<Department> => {
    const response = await apiClient.put<{ success: boolean; data: Department }>(
      `/departments/${departmentId}`,
      data
    );
    return response.data.data;
  },

  delete: async (departmentId: string): Promise<void> => {
    await apiClient.delete(`/departments/${departmentId}`);
  },

  activate: async (departmentId: string): Promise<void> => {
    await apiClient.patch(`/departments/${departmentId}/activate`);
  },

  deactivate: async (departmentId: string): Promise<void> => {
    await apiClient.patch(`/departments/${departmentId}/deactivate`);
  },
};
