import { apiClient } from "@/lib/api/client";
import { Category } from "@/types/common.types";

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name: string;
  description?: string;
}

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get<{ success: boolean; data: Category[] }>(
      "/categories"
    );
    return response.data.data;
  },

  getById: async (categoryId: string): Promise<Category> => {
    const response = await apiClient.get<{ success: boolean; data: Category }>(
      `/categories/${categoryId}`
    );
    return response.data.data;
  },

  create: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await apiClient.post<{ success: boolean; data: Category }>(
      "/categories",
      data
    );
    return response.data.data;
  },

  update: async (categoryId: string, data: UpdateCategoryRequest): Promise<Category> => {
    const response = await apiClient.put<{ success: boolean; data: Category }>(
      `/categories/${categoryId}`,
      data
    );
    return response.data.data;
  },

  delete: async (categoryId: string): Promise<void> => {
    await apiClient.delete(`/categories/${categoryId}`);
  },

  activate: async (categoryId: string): Promise<void> => {
    await apiClient.patch(`/categories/${categoryId}/activate`);
  },

  deactivate: async (categoryId: string): Promise<void> => {
    await apiClient.patch(`/categories/${categoryId}/deactivate`);
  },
};
