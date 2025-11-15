import { apiClient } from "@/lib/api/client";
import { Vendor } from "@/types/common.types";

export interface CreateVendorRequest {
  name: string;
  gstNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateVendorRequest {
  name: string;
  gstNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const vendorsApi = {
  getAll: async (): Promise<Vendor[]> => {
    const response = await apiClient.get<{ success: boolean; data: Vendor[] }>(
      "/vendors"
    );
    return response.data.data;
  },

  getById: async (vendorId: string): Promise<Vendor> => {
    const response = await apiClient.get<{ success: boolean; data: Vendor }>(
      `/vendors/${vendorId}`
    );
    return response.data.data;
  },

  create: async (data: CreateVendorRequest): Promise<Vendor> => {
    const response = await apiClient.post<{ success: boolean; data: Vendor }>(
      "/vendors",
      data
    );
    return response.data.data;
  },

  update: async (vendorId: string, data: UpdateVendorRequest): Promise<Vendor> => {
    const response = await apiClient.put<{ success: boolean; data: Vendor }>(
      `/vendors/${vendorId}`,
      data
    );
    return response.data.data;
  },

  delete: async (vendorId: string): Promise<void> => {
    await apiClient.delete(`/vendors/${vendorId}`);
  },

  activate: async (vendorId: string): Promise<void> => {
    await apiClient.patch(`/vendors/${vendorId}/activate`);
  },

  deactivate: async (vendorId: string): Promise<void> => {
    await apiClient.patch(`/vendors/${vendorId}/deactivate`);
  },
};
