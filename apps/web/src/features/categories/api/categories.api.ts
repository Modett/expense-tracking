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

type CategoryApiResponse = {
  id?: string;
  categoryId?: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type CategoryListApiResponse = {
  categories: CategoryApiResponse[];
  total: number;
};

const normalizeDate = (value: string | Date): string =>
  value instanceof Date ? value.toISOString() : value;

const mapCategory = (category: CategoryApiResponse): Category => {
  const categoryId = category.categoryId ?? category.id;
  if (!categoryId) {
    throw new Error("Category identifier missing from API response");
  }

  return {
    categoryId,
    name: category.name,
    description: category.description ?? undefined,
    isActive: category.isActive,
    createdAt: normalizeDate(category.createdAt),
    updatedAt: normalizeDate(category.updatedAt),
  };
};

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get<CategoryListApiResponse>("/categories");
    return response.data.categories.map(mapCategory);
  },

  getById: async (categoryId: string): Promise<Category> => {
    const response = await apiClient.get<CategoryApiResponse>(`/categories/${categoryId}`);
    return mapCategory(response.data);
  },

  create: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await apiClient.post<CategoryApiResponse>("/categories", data);
    return mapCategory(response.data);
  },

  update: async (categoryId: string, data: UpdateCategoryRequest): Promise<Category> => {
    const response = await apiClient.put<CategoryApiResponse>(`/categories/${categoryId}`, data);
    return mapCategory(response.data);
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
