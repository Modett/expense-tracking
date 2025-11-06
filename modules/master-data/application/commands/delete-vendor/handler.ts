import type { IVendorCommandRepository } from "../../../domain/repositories/IVendorCommandRepository.js";
import type { IVendorQueryRepository } from "../../../domain/repositories/IVendorQueryRepository.js";
import { VendorId } from "../../../domain/value-objects/index.js";
import type { DeleteVendorCommand } from "./command.js";

export class DeleteVendorCommandHandler {
  constructor(
    private readonly vendorRepository: IVendorCommandRepository,
    private readonly vendorQueryRepository: IVendorQueryRepository
  ) {}

  async handle(command: DeleteVendorCommand): Promise<void> {
    const vendorId = VendorId.fromString(command.id);

    const vendor = await this.vendorQueryRepository.findById(vendorId);
    if (!vendor) {
      throw new Error(`Vendor with id "${command.id}" not found`);
    }

    await this.vendorRepository.delete(vendorId);
  }
}
