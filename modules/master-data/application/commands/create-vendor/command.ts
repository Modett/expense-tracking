export class CreateVendorCommand {
  constructor(
    public readonly name: string,
    public readonly gstNumber?: string,
    public readonly email?: string,
    public readonly phone?: string,
    public readonly address?: string
  ) {}
}
