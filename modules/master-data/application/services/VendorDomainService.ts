import type { IVendorCommandRepository } from "../../domain/repositories/IVendorCommandRepository.js";
import type { VendorId, VendorName, Email } from "../../domain/value-objects/index.js";

export class VendorDomainService {
  constructor(private readonly vendorRepository: IVendorCommandRepository) {}

  async ensureNameIsUnique(name: VendorName): Promise<void> {
    const exists = await this.vendorRepository.existsByName(name.getValue());
    if (exists) {
      throw new Error(`Vendor with name "${name.getValue()}" already exists`);
    }
  }

  async ensureNameIsUniqueForUpdate(
    name: VendorName,
    currentVendorId: VendorId
  ): Promise<void> {
    const exists = await this.vendorRepository.existsByNameExcludingId(
      name.getValue(),
      currentVendorId
    );
    if (exists) {
      throw new Error(`Vendor with name "${name.getValue()}" already exists`);
    }
  }

  async ensureEmailIsUnique(email: Email): Promise<void> {
    const emailValue = email.getValue();
    if (!emailValue) return; // Skip validation if email is null/empty

    const exists = await this.vendorRepository.existsByEmail(emailValue);
    if (exists) {
      throw new Error(`Vendor with email "${emailValue}" already exists`);
    }
  }

  async ensureEmailIsUniqueForUpdate(
    email: Email,
    currentVendorId: VendorId
  ): Promise<void> {
    const emailValue = email.getValue();
    if (!emailValue) return; // Skip validation if email is null/empty

    const exists = await this.vendorRepository.existsByEmailExcludingId(
      emailValue,
      currentVendorId
    );
    if (exists) {
      throw new Error(`Vendor with email "${emailValue}" already exists`);
    }
  }
}
