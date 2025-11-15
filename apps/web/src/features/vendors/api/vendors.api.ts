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

type VendorApiResponse = {
  id?: string;
  vendorId?: string;
  name: string;
  gstNumber?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type VendorListApiResponse = {
  vendors: VendorApiResponse[];
  total: number;
};

const normalizeDate = (value: string | Date): string =>
  value instanceof Date ? value.toISOString() : value;

const mapVendor = (vendor: VendorApiResponse): Vendor => {
  const vendorId = vendor.vendorId ?? vendor.id;
  if (!vendorId) {
    throw new Error("Vendor identifier missing from API response");
  }

  return {
    vendorId,
    name: vendor.name,
    gstNumber: vendor.gstNumber ?? undefined,
    email: vendor.email ?? undefined,
    phone: vendor.phone ?? undefined,
    address: vendor.address ?? undefined,
    isActive: vendor.isActive,
    createdAt: normalizeDate(vendor.createdAt),
    updatedAt: normalizeDate(vendor.updatedAt),
  };
};

export const vendorsApi = {
  getAll: async (): Promise<Vendor[]> => {
    const response = await apiClient.get<VendorListApiResponse>("/vendors");
    return response.data.vendors.map(mapVendor);
  },

  getById: async (vendorId: string): Promise<Vendor> => {
    const response = await apiClient.get<VendorApiResponse>(`/vendors/${vendorId}`);
    return mapVendor(response.data);
  },

  create: async (data: CreateVendorRequest): Promise<Vendor> => {
    const response = await apiClient.post<VendorApiResponse>("/vendors", data);
    return mapVendor(response.data);
  },

  update: async (vendorId: string, data: UpdateVendorRequest): Promise<Vendor> => {
    const response = await apiClient.put<VendorApiResponse>(`/vendors/${vendorId}`, data);
    return mapVendor(response.data);
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
