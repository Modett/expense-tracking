import type { IVendorCommandRepository } from "../../../domain/repositories/IVendorCommandRepository.js";
import { Vendor } from "../../../domain/entities/Vendor.js";
import { VendorName, Email } from "../../../domain/value-objects/index.js";
import { VendorDomainService } from "../../services/VendorDomainService.js";
import type { CreateVendorCommand } from "./command.js";

export interface CreateVendorResponse {
  id: string;
  name: string;
  gstNumber: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: Date;
}

export class CreateVendorCommandHandler {
  constructor(
    private readonly vendorRepository: IVendorCommandRepository,
    private readonly vendorDomainService: VendorDomainService
  ) {}

  async handle(command: CreateVendorCommand): Promise<CreateVendorResponse> {
    const name = VendorName.create(command.name);
    const email = Email.create(command.email);

    await this.vendorDomainService.ensureNameIsUnique(name);
    await this.vendorDomainService.ensureEmailIsUnique(email);

    const vendor = Vendor.create(
      name,
      command.gstNumber,
      command.email,
      command.phone,
      command.address
    );

    await this.vendorRepository.save(vendor);

    return {
      id: vendor.id.getValue(),
      name: vendor.getName().getValue(),
      gstNumber: vendor.getGSTNumber().getValue(),
      email: vendor.getEmail().getValue(),
      phone: vendor.getPhone().getValue(),
      address: vendor.getAddress().getValue(),
      isActive: vendor.isActive(),
      createdAt: vendor.createdAt,
    };
  }
}
