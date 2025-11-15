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

type DepartmentApiResponse = {
  id?: string;
  departmentId?: string;
  name: string;
  code?: string | null;
  description?: string | null;
  isSystem?: boolean;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type DepartmentListApiResponse = {
  departments: DepartmentApiResponse[];
  total: number;
};

const normalizeDate = (value: string | Date): string =>
  value instanceof Date ? value.toISOString() : value;

const mapDepartment = (department: DepartmentApiResponse): Department => {
  const departmentId = department.departmentId ?? department.id;
  if (!departmentId) {
    throw new Error("Department identifier missing from API response");
  }

  return {
    departmentId,
    name: department.name,
    code: department.code ?? undefined,
    description: department.description ?? undefined,
    isSystem: department.isSystem ?? false,
    isActive: department.isActive,
    createdAt: normalizeDate(department.createdAt),
    updatedAt: normalizeDate(department.updatedAt),
  };
};

export const departmentsApi = {
  getAll: async (): Promise<Department[]> => {
    const response = await apiClient.get<DepartmentListApiResponse>("/departments");
    return response.data.departments.map(mapDepartment);
  },

  getById: async (departmentId: string): Promise<Department> => {
    const response = await apiClient.get<DepartmentApiResponse>(`/departments/${departmentId}`);
    return mapDepartment(response.data);
  },

  create: async (data: CreateDepartmentRequest): Promise<Department> => {
    const response = await apiClient.post<DepartmentApiResponse>("/departments", data);
    return mapDepartment(response.data);
  },

  update: async (departmentId: string, data: UpdateDepartmentRequest): Promise<Department> => {
    const response = await apiClient.put<DepartmentApiResponse>(`/departments/${departmentId}`, data);
    return mapDepartment(response.data);
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
