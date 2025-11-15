import axios from "@/lib/axios";
import { Tag, CreateTagRequest, UpdateTagRequest, GetAllTagsParams } from "../types";

export const tagsApi = {
  getAll: async (params?: GetAllTagsParams): Promise<Tag[]> => {
    const response = await axios.get("/tags", { params });
    return response.data;
  },

  getById: async (tagId: string): Promise<Tag> => {
    const response = await axios.get(`/tags/${tagId}`);
    return response.data;
  },

  create: async (data: CreateTagRequest): Promise<Tag> => {
    const response = await axios.post("/tags", data);
    return response.data;
  },

  update: async (tagId: string, data: UpdateTagRequest): Promise<Tag> => {
    const response = await axios.patch(`/tags/${tagId}`, data);
    return response.data;
  },

  delete: async (tagId: string): Promise<void> => {
    await axios.delete(`/tags/${tagId}`);
  },

  activate: async (tagId: string): Promise<void> => {
    await axios.patch(`/tags/${tagId}/activate`);
  },

  deactivate: async (tagId: string): Promise<void> => {
    await axios.patch(`/tags/${tagId}/deactivate`);
  },
};

export type { CreateTagRequest, UpdateTagRequest, GetAllTagsParams };
