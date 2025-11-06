import type { IVendorCommandRepository } from "../../../domain/repositories/IVendorCommandRepository.js";
import type { IVendorQueryRepository } from "../../../domain/repositories/IVendorQueryRepository.js";
import { VendorId } from "../../../domain/value-objects/index.js";
import type { DeactivateVendorCommand } from "./command.js";

export class DeactivateVendorCommandHandler {
  constructor(
    private readonly vendorRepository: IVendorCommandRepository,
    private readonly vendorQueryRepository: IVendorQueryRepository
  ) {}

  async handle(command: DeactivateVendorCommand): Promise<void> {
    const vendorId = VendorId.fromString(command.id);

    const vendor = await this.vendorQueryRepository.findById(vendorId);
    if (!vendor) {
      throw new Error(`Vendor with id "${command.id}" not found`);
    }

    vendor.deactivate();

    await this.vendorRepository.update(vendor);
  }
}
