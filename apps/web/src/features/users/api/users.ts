import { apiClient } from "@/lib/api/client";
import { User, CreateUserRequest, UpdateUserRequest, GetAllUsersParams } from "../types";

export const usersApi = {
  getAll: async (params?: GetAllUsersParams): Promise<User[]> => {
    const response = await apiClient.get<{ success: boolean; data: User[] }>("/users", { params });
    return response.data.data;
  },

  getById: async (userId: string): Promise<User> => {
    const response = await apiClient.get<{ success: boolean; data: User }>(`/users/${userId}`);
    return response.data.data;
  },

  create: async (data: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post<{ success: boolean; data: User }>("/users", data);
    return response.data.data;
  },

  update: async (userId: string, data: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.patch<{ success: boolean; data: User }>(`/users/${userId}`, data);
    return response.data.data;
  },

  updateProfile: async (data: { name: string; email: string }): Promise<void> => {
    await apiClient.put("/auth/profile", data);
  },

  updateRole: async (userId: string, role: string): Promise<void> => {
    await apiClient.put(`/users/${userId}/role`, { role });
  },

  delete: async (userId: string): Promise<void> => {
    await apiClient.delete(`/users/${userId}`);
  },

  activate: async (userId: string): Promise<void> => {
    await apiClient.patch(`/users/${userId}/activate`);
  },

  deactivate: async (userId: string): Promise<void> => {
    await apiClient.patch(`/users/${userId}/deactivate`);
  },
};

export type { CreateUserRequest, UpdateUserRequest, GetAllUsersParams };
