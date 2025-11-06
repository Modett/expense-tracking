import type { IVendorCommandRepository } from "../../../domain/repositories/IVendorCommandRepository.js";
import type { IVendorQueryRepository } from "../../../domain/repositories/IVendorQueryRepository.js";
import { VendorId, VendorName, Email } from "../../../domain/value-objects/index.js";
import { VendorDomainService } from "../../services/VendorDomainService.js";
import type { UpdateVendorCommand } from "./command.js";

export interface UpdateVendorResponse {
  id: string;
  name: string;
  gstNumber: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  updatedAt: Date;
}

export class UpdateVendorCommandHandler {
  constructor(
    private readonly vendorRepository: IVendorCommandRepository,
    private readonly vendorQueryRepository: IVendorQueryRepository,
    private readonly vendorDomainService: VendorDomainService
  ) {}

  async handle(command: UpdateVendorCommand): Promise<UpdateVendorResponse> {
    const vendorId = VendorId.fromString(command.id);
    const name = VendorName.create(command.name);
    const email = Email.create(command.email);

    const vendor = await this.vendorQueryRepository.findById(vendorId);
    if (!vendor) {
      throw new Error(`Vendor with id "${command.id}" not found`);
    }

    await this.vendorDomainService.ensureNameIsUniqueForUpdate(name, vendorId);
    await this.vendorDomainService.ensureEmailIsUniqueForUpdate(email, vendorId);

    vendor.update(name, command.gstNumber, command.email, command.phone, command.address);

    await this.vendorRepository.update(vendor);

    return {
      id: vendor.id.getValue(),
      name: vendor.getName().getValue(),
      gstNumber: vendor.getGSTNumber().getValue(),
      email: vendor.getEmail().getValue(),
      phone: vendor.getPhone().getValue(),
      address: vendor.getAddress().getValue(),
      isActive: vendor.isActive(),
      updatedAt: vendor.updatedAt,
    };
  }
}
