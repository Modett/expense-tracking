import axios from "@/lib/axios";
import { User, CreateUserRequest, UpdateUserRequest, GetAllUsersParams } from "../types";

export const usersApi = {
  getAll: async (params?: GetAllUsersParams): Promise<User[]> => {
    const response = await axios.get("/users", { params });
    return response.data;
  },

  getById: async (userId: string): Promise<User> => {
    const response = await axios.get(`/users/${userId}`);
    return response.data;
  },

  create: async (data: CreateUserRequest): Promise<User> => {
    const response = await axios.post("/users", data);
    return response.data;
  },

  update: async (userId: string, data: UpdateUserRequest): Promise<User> => {
    const response = await axios.patch(`/users/${userId}`, data);
    return response.data;
  },

  delete: async (userId: string): Promise<void> => {
    await axios.delete(`/users/${userId}`);
  },

  activate: async (userId: string): Promise<void> => {
    await axios.patch(`/users/${userId}/activate`);
  },

  deactivate: async (userId: string): Promise<void> => {
    await axios.patch(`/users/${userId}/deactivate`);
  },
};

export type { CreateUserRequest, UpdateUserRequest, GetAllUsersParams };
