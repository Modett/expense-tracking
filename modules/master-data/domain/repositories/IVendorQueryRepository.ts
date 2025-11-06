import type { Vendor } from "../entities/Vendor.js";
import type { VendorId } from "../value-objects/index.js";

export interface VendorListQuery {
  limit?: number;
  offset?: number;
  isActive?: boolean;
  searchTerm?: string;
}

export interface IVendorQueryRepository {
  findById(id: VendorId): Promise<Vendor | null>;
  findAll(query: VendorListQuery): Promise<Vendor[]>;
  findByName(name: string): Promise<Vendor | null>;
  findByEmail(email: string): Promise<Vendor | null>;
  findActiveVendors(limit?: number, offset?: number): Promise<Vendor[]>;
  searchVendors(searchTerm: string, limit?: number, offset?: number): Promise<Vendor[]>;
  count(filters?: { isActive?: boolean }): Promise<number>;
}
