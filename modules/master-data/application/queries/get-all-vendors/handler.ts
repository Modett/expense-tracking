import type { IVendorQueryRepository } from "../../../domain/repositories/IVendorQueryRepository.js";
import type { GetAllVendorsQuery } from "./query.js";

export interface VendorListItemResponse {
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

export interface GetAllVendorsResponse {
  vendors: VendorListItemResponse[];
  total: number;
}

export class GetAllVendorsQueryHandler {
  constructor(private readonly vendorQueryRepository: IVendorQueryRepository) {}

  async handle(query: GetAllVendorsQuery): Promise<GetAllVendorsResponse> {
    const vendors = await this.vendorQueryRepository.findAll({
      ...(query.limit !== undefined && { limit: query.limit }),
      ...(query.offset !== undefined && { offset: query.offset }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.searchTerm !== undefined && { searchTerm: query.searchTerm }),
    });

    const total = await this.vendorQueryRepository.count({
      ...(query.isActive !== undefined && { isActive: query.isActive }),
    });

    return {
      vendors: vendors.map((vendor) => ({
        id: vendor.id.getValue(),
        name: vendor.getName().getValue(),
        gstNumber: vendor.getGSTNumber().getValue(),
        email: vendor.getEmail().getValue(),
        phone: vendor.getPhone().getValue(),
        address: vendor.getAddress().getValue(),
        isActive: vendor.isActive(),
        createdAt: vendor.createdAt,
        updatedAt: vendor.updatedAt,
      })),
      total,
    };
  }
}
