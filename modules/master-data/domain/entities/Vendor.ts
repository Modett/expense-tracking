import { VendorId, VendorName, VendorStatus, GSTNumber, Email, Phone, Address } from "../value-objects/index.js";

export class Vendor {
  private constructor(
    public readonly id: VendorId,
    private name: VendorName,
    private gstNumber: GSTNumber,
    private email: Email,
    private phone: Phone,
    private address: Address,
    private status: VendorStatus,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(
    name: VendorName,
    gstNumber?: string,
    email?: string,
    phone?: string,
    address?: string
  ): Vendor {
    return new Vendor(
      VendorId.create(),
      name,
      GSTNumber.create(gstNumber),
      Email.create(email),
      Phone.create(phone),
      Address.create(address),
      VendorStatus.active(),
      new Date(),
      new Date()
    );
  }

  static fromPersistence(
    id: VendorId,
    name: VendorName,
    gstNumber: GSTNumber,
    email: Email,
    phone: Phone,
    address: Address,
    status: VendorStatus,
    createdAt: Date,
    updatedAt: Date
  ): Vendor {
    return new Vendor(id, name, gstNumber, email, phone, address, status, createdAt, updatedAt);
  }

  // Getters
  getName(): VendorName {
    return this.name;
  }

  getGSTNumber(): GSTNumber {
    return this.gstNumber;
  }

  getEmail(): Email {
    return this.email;
  }

  getPhone(): Phone {
    return this.phone;
  }

  getAddress(): Address {
    return this.address;
  }

  getStatus(): VendorStatus {
    return this.status;
  }

  isActive(): boolean {
    return this.status.isActiveStatus();
  }

  // Business Logic Methods
  updateName(name: VendorName): void {
    this.name = name;
    this.updatedAt = new Date();
  }

  updateGSTNumber(gstNumber: string | undefined): void {
    this.gstNumber = GSTNumber.create(gstNumber);
    this.updatedAt = new Date();
  }

  updateEmail(email: string | undefined): void {
    this.email = Email.create(email);
    this.updatedAt = new Date();
  }

  updatePhone(phone: string | undefined): void {
    this.phone = Phone.create(phone);
    this.updatedAt = new Date();
  }

  updateAddress(address: string | undefined): void {
    this.address = Address.create(address);
    this.updatedAt = new Date();
  }

  activate(): void {
    this.status = VendorStatus.active();
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.status = VendorStatus.inactive();
    this.updatedAt = new Date();
  }

  update(
    name: VendorName,
    gstNumber: string | undefined,
    email: string | undefined,
    phone: string | undefined,
    address: string | undefined
  ): void {
    this.name = name;
    this.gstNumber = GSTNumber.create(gstNumber);
    this.email = Email.create(email);
    this.phone = Phone.create(phone);
    this.address = Address.create(address);
    this.updatedAt = new Date();
  }
}
