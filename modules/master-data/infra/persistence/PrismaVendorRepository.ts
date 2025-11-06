import type { PrismaClient } from "@prisma/client";
import type { IVendorCommandRepository } from "../../domain/repositories/IVendorCommandRepository.js";
import type { Vendor } from "../../domain/entities/Vendor.js";
import type { VendorId } from "../../domain/value-objects/index.js";

export class PrismaVendorRepository implements IVendorCommandRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(vendor: Vendor): Promise<void> {
    await this.prisma.vendor.create({
      data: {
        vendorId: vendor.id.getValue(),
        name: vendor.getName().getValue(),
        gstNumber: vendor.getGSTNumber().getValue(),
        email: vendor.getEmail().getValue(),
        phone: vendor.getPhone().getValue(),
        address: vendor.getAddress().getValue(),
        isActive: vendor.isActive(),
        createdAt: vendor.createdAt,
        updatedAt: vendor.updatedAt,
      },
    });
  }

  async update(vendor: Vendor): Promise<void> {
    await this.prisma.vendor.update({
      where: { vendorId: vendor.id.getValue() },
      data: {
        name: vendor.getName().getValue(),
        gstNumber: vendor.getGSTNumber().getValue(),
        email: vendor.getEmail().getValue(),
        phone: vendor.getPhone().getValue(),
        address: vendor.getAddress().getValue(),
        isActive: vendor.isActive(),
        updatedAt: vendor.updatedAt,
      },
    });
  }

  async delete(id: VendorId): Promise<void> {
    await this.prisma.vendor.delete({
      where: { vendorId: id.getValue() },
    });
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.prisma.vendor.count({
      where: { name },
    });
    return count > 0;
  }

  async existsByNameExcludingId(name: string, excludeId: VendorId): Promise<boolean> {
    const count = await this.prisma.vendor.count({
      where: {
        name,
        vendorId: { not: excludeId.getValue() },
      },
    });
    return count > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.vendor.count({
      where: { email },
    });
    return count > 0;
  }

  async existsByEmailExcludingId(email: string, excludeId: VendorId): Promise<boolean> {
    const count = await this.prisma.vendor.count({
      where: {
        email,
        vendorId: { not: excludeId.getValue() },
      },
    });
    return count > 0;
  }
}
