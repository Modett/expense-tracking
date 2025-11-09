export class CreateInventoryDropCommand {
  constructor(
    public readonly dropNumber: string,
    public readonly fabricType: string,
    public readonly quantity: number,
    public readonly unitCost: number,
    public readonly receivedOn: Date | undefined,
    public readonly supplier: string | undefined
  ) {}
}
