import { apiClient } from "@/lib/api/client";
import { Tag, CreateTagRequest, UpdateTagRequest, GetAllTagsParams, TagTypeEnum } from "../types";

type TagApiResponse = {
  id?: string;
  tagId?: string;
  name: string;
  type: string;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
};

type TagListApiResponse = {
  tags: TagApiResponse[];
  total: number;
};

const normalizeDate = (value: string | Date | undefined): string =>
  value instanceof Date ? value.toISOString() : value ?? new Date().toISOString();

const mapTag = (tag: TagApiResponse): Tag => {
  const tagId = tag.tagId ?? tag.id;
  if (!tagId) {
    throw new Error("Tag identifier missing from API response");
  }

  return {
    tagId,
    name: tag.name,
    type: tag.type as TagTypeEnum,
    isActive: tag.isActive,
    createdAt: normalizeDate(tag.createdAt),
    updatedAt: normalizeDate(tag.updatedAt ?? tag.createdAt),
  };
};

export const tagsApi = {
  getAll: async (params?: GetAllTagsParams): Promise<Tag[]> => {
    const response = await apiClient.get<TagListApiResponse>("/tags", { params });
    return response.data.tags.map(mapTag);
  },

  getById: async (tagId: string): Promise<Tag> => {
    const response = await apiClient.get<TagApiResponse>(`/tags/${tagId}`);
    return mapTag(response.data);
  },

  create: async (data: CreateTagRequest): Promise<Tag> => {
    const response = await apiClient.post<TagApiResponse>("/tags", data);
    return mapTag(response.data);
  },

  update: async (tagId: string, data: UpdateTagRequest): Promise<void> => {
    await apiClient.put(`/tags/${tagId}`, data);
  },

  delete: async (tagId: string): Promise<void> => {
    await apiClient.delete(`/tags/${tagId}`);
  },

  activate: async (tagId: string): Promise<void> => {
    await apiClient.patch(`/tags/${tagId}/activate`);
  },

  deactivate: async (tagId: string): Promise<void> => {
    await apiClient.patch(`/tags/${tagId}/deactivate`);
  },
};

export type { CreateTagRequest, UpdateTagRequest, GetAllTagsParams };
