import type { IVendorQueryRepository } from "../../../domain/repositories/IVendorQueryRepository.js";
import { VendorId } from "../../../domain/value-objects/index.js";
import type { GetVendorByIdQuery } from "./query.js";

export interface VendorResponse {
  id: string;
  name: string;
  gstNumber: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class GetVendorByIdQueryHandler {
  constructor(private readonly vendorQueryRepository: IVendorQueryRepository) {}

  async handle(query: GetVendorByIdQuery): Promise<VendorResponse | null> {
    const vendorId = VendorId.fromString(query.id);
    const vendor = await this.vendorQueryRepository.findById(vendorId);

    if (!vendor) {
      return null;
    }

    return {
      id: vendor.id.getValue(),
      name: vendor.getName().getValue(),
      gstNumber: vendor.getGSTNumber().getValue(),
      email: vendor.getEmail().getValue(),
      phone: vendor.getPhone().getValue(),
      address: vendor.getAddress().getValue(),
      isActive: vendor.isActive(),
      createdAt: vendor.createdAt,
      updatedAt: vendor.updatedAt,
    };
  }
}
