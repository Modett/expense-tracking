import type { PrismaClient } from "@prisma/client";
import type {
  IVendorQueryRepository,
  VendorListQuery,
} from "../../domain/repositories/IVendorQueryRepository.js";
import { Vendor } from "../../domain/entities/Vendor.js";
import {
  VendorId,
  VendorName,
  VendorStatus,
  GSTNumber,
  Email,
  Phone,
  Address,
} from "../../domain/value-objects/index.js";

export class PrismaVendorQueryRepository implements IVendorQueryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: VendorId): Promise<Vendor | null> {
    const vendor = await this.prisma.vendor.findUnique({
      where: { vendorId: id.getValue() },
    });

    if (!vendor) {
      return null;
    }

    return Vendor.fromPersistence(
      VendorId.fromString(vendor.vendorId),
      VendorName.create(vendor.name),
      GSTNumber.fromString(vendor.gstNumber),
      Email.fromString(vendor.email),
      Phone.fromString(vendor.phone),
      Address.fromString(vendor.address),
      VendorStatus.fromBoolean(vendor.isActive),
      vendor.createdAt,
      vendor.updatedAt
    );
  }

  async findAll(query: VendorListQuery): Promise<Vendor[]> {
    const vendors = await this.prisma.vendor.findMany({
      where: {
        ...(query.isActive !== undefined && { isActive: query.isActive }),
        ...(query.searchTerm && {
          OR: [
            { name: { contains: query.searchTerm, mode: "insensitive" } },
            { email: { contains: query.searchTerm, mode: "insensitive" } },
            { gstNumber: { contains: query.searchTerm, mode: "insensitive" } },
            { phone: { contains: query.searchTerm, mode: "insensitive" } },
          ],
        }),
      },
      ...(query.limit !== undefined && { take: query.limit }),
      ...(query.offset !== undefined && { skip: query.offset }),
      orderBy: { createdAt: "desc" },
    });

    return vendors.map((vendor) =>
      Vendor.fromPersistence(
        VendorId.fromString(vendor.vendorId),
        VendorName.create(vendor.name),
        GSTNumber.fromString(vendor.gstNumber),
        Email.fromString(vendor.email),
        Phone.fromString(vendor.phone),
        Address.fromString(vendor.address),
        VendorStatus.fromBoolean(vendor.isActive),
        vendor.createdAt,
        vendor.updatedAt
      )
    );
  }

  async findByName(name: string): Promise<Vendor | null> {
    const vendor = await this.prisma.vendor.findFirst({
      where: { name },
    });

    if (!vendor) {
      return null;
    }

    return Vendor.fromPersistence(
      VendorId.fromString(vendor.vendorId),
      VendorName.create(vendor.name),
      GSTNumber.fromString(vendor.gstNumber),
      Email.fromString(vendor.email),
      Phone.fromString(vendor.phone),
      Address.fromString(vendor.address),
      VendorStatus.fromBoolean(vendor.isActive),
      vendor.createdAt,
      vendor.updatedAt
    );
  }

  async findByEmail(email: string): Promise<Vendor | null> {
    const vendor = await this.prisma.vendor.findFirst({
      where: { email },
    });

    if (!vendor) {
      return null;
    }

    return Vendor.fromPersistence(
      VendorId.fromString(vendor.vendorId),
      VendorName.create(vendor.name),
      GSTNumber.fromString(vendor.gstNumber),
      Email.fromString(vendor.email),
      Phone.fromString(vendor.phone),
      Address.fromString(vendor.address),
      VendorStatus.fromBoolean(vendor.isActive),
      vendor.createdAt,
      vendor.updatedAt
    );
  }

  async findActiveVendors(
    limit?: number,
    offset?: number
  ): Promise<Vendor[]> {
    return this.findAll({
      ...(limit !== undefined && { limit }),
      ...(offset !== undefined && { offset }),
      isActive: true,
    });
  }

  async searchVendors(
    searchTerm: string,
    limit?: number,
    offset?: number
  ): Promise<Vendor[]> {
    return this.findAll({
      searchTerm,
      ...(limit !== undefined && { limit }),
      ...(offset !== undefined && { offset }),
    });
  }

  async count(filters?: { isActive?: boolean }): Promise<number> {
    return this.prisma.vendor.count({
      where: {
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      },
    });
  }
}
