import type { Vendor } from "../entities/Vendor.js";
import type { VendorId } from "../value-objects/index.js";

export interface IVendorCommandRepository {
  save(vendor: Vendor): Promise<void>;
  update(vendor: Vendor): Promise<void>;
  delete(id: VendorId): Promise<void>;
  existsByName(name: string): Promise<boolean>;
  existsByNameExcludingId(name: string, excludeId: VendorId): Promise<boolean>;
  existsByEmail(email: string): Promise<boolean>;
  existsByEmailExcludingId(email: string, excludeId: VendorId): Promise<boolean>;
}
